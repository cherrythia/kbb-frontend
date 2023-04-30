/* eslint-env es6 */
/* global Vue, axios */

/* eslint indent: ["error", 2] */
/* exported app, dragstart_handler, dragover_handler,
 dragleave_handler, drop_handler */
/* eslint quote-props: ["error", "as-needed"] */
/* eslint func-names: ["error", "never"] */
/* eslint id-length: ["error", { "exceptions": ["i"] }] */
/* eslint no-magic-numbers: ["error", { "ignore": [0, 1] }] */


window.app = new Vue({
  data: {
    cards: [], // Ask when will this be populated? Find the logic that helps to populate this...
    columns: ["waiting", "doing", "done"],
    edit_card: null,
    show_archived_cards: false,
    show_card_ids: false,
    show_card_timestamps: false,
    allUsers: [],
  },

  el: "#kanban",
  methods: {
    cancel_card_edit: function () {
      this.edit_card = null;
    },
    complete_card_edit: function (card_id) {
      if (this.edit_card) {
        this.edit_card.text = this.$refs.card_edit_text.value;
        this.edit_card.color = this.$refs.card_edit_color.value;
        this.edit_card.archived = this.$refs.card_edit_archive.checked;
        this.update_card(card_id);
        this.edit_card = null;
      }
    },
    create_card: function (ev) { // Create card function
      let vue_app = this;
      let form = ev.target;
      let form_color = form.color.value;

      axios.post(BACKEND_HOST_URL.concat("/task/create_task"), {
        user_id: 1,
        project_id: 1,
        content: form.text.value,
      }, {
        headers: {
          'content-type': 'application/json'
        }
      }).then(function () { // This line posts the form data
        vue_app.refresh_cards();
        form.reset();
        vue_app.$refs.new_card_color.value = form_color;
      });
    },
    delete_card: function (card_id) {
      let vue_app = this;

      if (window.confirm("Delete card?")) {
        axios.post(BACKEND_HOST_URL.concat("/task/delete_task"), null, {
          params: {
            id: card_id
          }
        }).then(function () {
          for (let i = 0; i < vue_app.cards.length; i += 1) {
            if (vue_app.cards[i].id === card_id) {
              vue_app.edit_card = null;
              delete vue_app.cards[i];
              vue_app.cards.splice(i, 1);
            }
          }
        });
      }          
    },
    get_card: function (id) { // Get cards, read array only
      let target = id;

      if (typeof target === "string") {
        target = parseInt(target.replace("card", ""), 10);
      }
      for (let i = 0; i < this.cards.length; i += 1) {
        if (this.cards[i].id === target) {
          return this.cards[i];
        }
      }
    },
    handle_card_edit_click: function (ev) {
      if (ev.target === this.$refs.card_edit_container) {
        this.edit_card = null;
      }
    },
    refresh_cards: function () { // Add cards, grabs the cards data then store it in response.data and then insert into vue_app.cards
      let vue_app = this;

      axios.get(BACKEND_HOST_URL.concat("/task/get_all_task")).then(function (response) {
        vue_app.cards = response.data; // I have to change this to speak to the backend api
      });
    },
    refresh_columns: function () {
      let vue_app = this;

      // axios.get("columns").then(function (response) {
      //   vue_app.columns = response.data;
      //   document.documentElement.style.setProperty(
      //     "--kanban-columns",
      //     vue_app.columns.length
      //   );
      // });
    },
    start_card_edit: function (card_id) {
      this.edit_card = this.get_card(card_id);

      let vue_app = this;

      Vue.nextTick(function () {
        vue_app.$refs.card_edit_text.value = vue_app.edit_card.text;
        vue_app.$refs.card_edit_text.focus();
        vue_app.$refs.card_edit_text.select();
      });
    },
    update_card: function (id) {
      let card = this.get_card(id);
      axios.post(BACKEND_HOST_URL.concat("/task/update_task"), card, {
        headers: {
          'content-type': 'application/json'
        }
      });
    },
    update_card_color: function (card_id, ev) {
      this.get_card(card_id).color = ev.target.value;
      this.update_card(card_id);
    },
    get_all_users: function () {
      let vue_app = this;

      axios.get(BACKEND_HOST_URL.concat("/user")).then(function (response) {
        vue_app.allUsers = response.data; // I have to change this to speak to the backend api
      });
    },
    get_assigned_user: function (email) {
      if (email.includes('@')) {
        return email.split('@')[0];
      } else {
        return email;
      }
    },
    init: function () {
      this.refresh_columns();
      this.refresh_cards();
      this.get_all_users();
      this.$refs.new_card_color.value = getComputedStyle(document.documentElement).getPropertyValue("--default-card-color").replace(/ /g, "");
    }
  }
});

function dragstart_handler(ev) {
  // Add the target element's id to the data transfer object
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.dropEffect = "move";
}

function dragover_handler(ev) {
  ev.preventDefault();
  // Set the dropEffect to move
  ev.dataTransfer.dropEffect = "move";

  let container = ev.target;

  while (container.tagName !== "SECTION") {
    container = container.parentElement;
  }

  if (!container.classList.contains("drop-target")) {
    container.classList.add("drop-target");
  }
}

function dragleave_handler(ev) {
  let container = ev.target;

  while (container.tagName !== "SECTION") {
    container = container.parentElement;
  }
  container.classList.remove("drop-target");
}

function drop_handler(ev) {
  ev.preventDefault();

  // TODO: handle invalid card ID
  let card = window.app.get_card(ev.dataTransfer.getData("text"));
  console.log("draggable drop", card)
  let container = ev.target;

  while (container.tagName !== "SECTION") {
    container = container.parentElement;
  }
  container.classList.remove("drop-target");

  let new_col = container.getElementsByTagName("h2")[0].textContent;
  let column_cards = container.getElementsByTagName("li");
  let moving_down = false;
  let before_id = null;

  for (let i = 0; i < column_cards.length; i += 1) {
    if (parseInt(column_cards[i].id.replace("card", ""), 10) === card.id) {
      moving_down = true;
    }

    let event_absolute_y = ev.y + document.documentElement.scrollTop;

    // Mouse above list
    if (column_cards[i].offsetTop > event_absolute_y) {
      before_id = "all";
      break;
      // On list item
    } else if (i < (column_cards.length - 1) && event_absolute_y <= column_cards[i + 1].offsetTop) {
      if (moving_down) {
        before_id = parseInt(column_cards[i + 1].id.replace("card", ""), 10);
      } else {
        before_id = parseInt(column_cards[i].id.replace("card", ""), 10);
      }
      break;
    } else if (i === (column_cards.length - 1)) {
      // On last list item
      if (event_absolute_y < column_cards[i].offsetTop + (column_cards[i].offsetHeight) && card.column !== new_col) {
        before_id = parseInt(column_cards[i].id.replace("card", ""), 10);
        // Past the end
      } else {
        before_id = null;
      }
    }
  }

  // todo: prioritising order
  // if (column_cards.length > 0 && card.id !== before_id) {
  //   // update card
  //   axios.post("card/reorder", {
  //     before: before_id,
  //     card: card.id
  //   }).then(function () {
  //     window.app.refresh_cards();
  //   });
  // }

  // changing columns
  if (card.column !== new_col) {
    card.status = new_col;
    window.app.update_card(card.id);
  }
}

// Create project function
function create_project(ev) {
  let vue_app = this;
  let form = ev.target;
  console.log('create project')
  axios.post(BACKEND_HOST_URL.concat("/project/create_project"), {

    name: form.project_name.value,
    content: form.description.value,
  },

    {
      headers: {
        'content-type': 'application/json'
      }
    }).then(function () { // This line posts the form data

      vue_app.refresh_cards();
      form.reset();
      vue_app.$refs.new_card_color.value = form_color;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  window.app.init();
});
