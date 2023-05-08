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
    tempType: null,
    user: null,
    card_types: ["task", "bug", "story"],
    project_name: null,
    role: ""
  },

  el: "#kanban",
  methods: {
    cancel_card_edit: function () {
      this.edit_card = null;
      this.tempType = null;
    },
    complete_card_edit: function (card_id) {
      if (this.edit_card) {
        this.edit_card.content = this.$refs.card_edit_input.value;
        this.edit_card.status = this.$refs.card_edit_status.value;
        this.edit_card.type = this.$refs.card_edit_type.value;
        this.edit_card.user_id = this.$refs.card_edit_assigned.value;
        if (this.tempType == 'bug') {
          this.edit_card.version = this.$refs.card_edit_temp.value;
          this.edit_card.story_points = null;
        } else if (this.tempType == 'story') {
          this.edit_card.story_points = this.$refs.card_edit_temp.value;
          this.edit_card.version = null;
        } else if (this.tempType == 'task') {
          this.edit_card.story_points = null;
          this.edit_card.version = null;
        }
        this.update_card(card_id);
        this.edit_card = null;
      }
    },
    get_user_details: function (user_email) {
      axios.get(BACKEND_HOST_URL.concat("/user"), {
        params: {
          userEmail: input_name
        }
      }).then((response) => {
        user = response.data
      }, (error) => {
        console.log(error);
      });
    },
    create_card: function (ev) { // Create card function
      let vue_app = this;
      let form = ev.target;

      let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));

      axios.post(BACKEND_HOST_URL.concat("/task/create_task"), {
        user_id: loginUser.id,
        project_id: loginUser.project_id,
        content: form.text.value,
        type: 'task'
      }, {
        headers: {
          'content-type': 'application/json'
        }
      }).catch(function (error) {
        alert(error.response.data)
      }).then(function () { // This line posts the form data
        vue_app.refresh_cards();
        form.reset();
      });
    },
    delete_card: function (card_id) {
      let vue_app = this;

      if (window.confirm("Delete card?")) {
        axios.post(BACKEND_HOST_URL.concat("/task/delete_task"), null, {
          params: {
            id: card_id
          }
        }).catch(function (error) {
          alert(error.response.data)
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
      console.log("card refreshed")
      let vue_app = this;
      let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
      vue_app.role = loginUser.role
      if (vue_app.role == "") {
        vue_app.role = "unassigned"
      }

      axios.get(BACKEND_HOST_URL.concat("/task/get_task"), {
        params: {
          project_id: loginUser.project_id
        }
      }).catch(function (error) {
        alert(error)
      }).then(function (response) {
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
      this.tempType = this.edit_card.type;

      Vue.nextTick(function () {
        vue_app.$refs.card_edit_input.value = vue_app.edit_card.content;
        vue_app.$refs.card_edit_status.value = vue_app.edit_card.status;
        vue_app.$refs.card_edit_type.value = vue_app.edit_card.type;
        vue_app.$refs.card_edit_assigned.value = vue_app.edit_card.user_id;
      });
    },
    update_card: function (id) {
      let vue_app = this;
      let edit_card = this.edit_card;
      if (edit_card === null) {
        edit_card = this.get_card(id);
      }
      axios.post(BACKEND_HOST_URL.concat("/task/update_task"), edit_card, {
        headers: {
          'content-type': 'application/json'
        }
      }).catch(function (error) {
        alert(error.response.data)
      }).then(function () {
        vue_app.refresh_cards();
      });
    },
    update_card_color: function (card_id, ev) {
      this.get_card(card_id).color = ev.target.value;
      this.update_card(card_id);
    },
    get_all_users_by_project_id: function () {
      let vue_app = this;
      let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));

      axios.get(BACKEND_HOST_URL.concat("/user/get_user_by_project_id"), {
        params: {
          projectId: loginUser.project_id
        }
      }).catch(function (error) {
        alert(error.response.data)
      }).then(function (response) {
        vue_app.allUsers = response.data;
      });
    },
    get_assigned_user: function (email) {
      if (email.includes('@')) {
        return email.split('@')[0];
      } else {
        return email;
      }
    },
    get_projectName: function () {
      let vue_app = this;
      let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
      axios.get(BACKEND_HOST_URL.concat("/project"), {
        params: {
          user_id: loginUser.project_id
        }
      }, {
        headers: {
          'content-type': 'application/json'
        }
      }).catch(function (error) {
        alert(error.response.data)
      }).then(function (response) {
        vue_app.project_name = response.data.project_name;
      });
    },
    get_current_time: function (dateTime) {
      let date = new Date(dateTime);
      return date.toLocaleString();
    },
    init: function () {
      this.refresh_columns();
      this.loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
      if (this.loginUser.project_id) {
        this.get_all_users_by_project_id();
        this.get_projectName();
      }
      this.refresh_cards();
    },
    update_role: function (role) {
      this.role = role
    }
  }
});

function onRoleChange(roleChange) {
  let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
  loginUser.role = roleChange.value
  axios.put(BACKEND_HOST_URL.concat("/user"), loginUser, {
    headers: {
      'content-type': 'application/json'
    }
  }).catch(function (error) {
    alert(error.response.data)
  }).then(function (response) {
    console.log("role update done: ", response)
    sessionStorage.setItem("loginUser", JSON.stringify(loginUser))
    window.app.update_role(roleChange.value)
    alert("role has been updated")
  });
  console.log(roleChange.value)
}

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
// function create_project(ev) {
//   let vue_app = this;
//   let form = ev.target;
//   console.log('create project')
//   axios.post(BACKEND_HOST_URL.concat("/project/create_project"), {

//     name: form.project_name.value,
//     content: form.description.value,
//   },

//     {
//       headers: {
//         'content-type': 'application/json'
//       }
//     }).then(function () { // This line posts the form data

//       vue_app.refresh_cards();
//       form.reset();
//       vue_app.$refs.new_card_color.value = form_color;
//     });
// }

document.addEventListener("DOMContentLoaded", function () {
  window.app.init();
});
