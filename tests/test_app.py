from src.app import app

def test_index_route():
    response = app.test_client().get('/')

    assert response.status_code == 200
    assert response.data.decode('utf-8') != ''

def test_main_route():
    response = app.test_client().get('/main')

    assert response.status_code == 200
    assert response.data.decode('utf-8') != ''