let dados;
let doenca = null;
let perguntasRestantes;
let perguntasFeitas = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('perguntas.csv')
        .then(response => response.text())
        .then(csvText => {
            dados = Papa.parse(csvText, { header: true }).data;
            perguntasRestantes = Object.keys(dados[0]).slice(1);
            mostrarProximaPergunta();
        })
        .catch(error => console.error('Erro ao carregar o CSV:', error));
});

function mostrarProximaPergunta() {
    
    document.getElementById('question-container2').classList.add('hidden');

    if (dados.length === 1) {
        doenca = dados[0]['Doenca'];
        mostrarResultado();
        return;
    }

    if (dados.length === 0 || perguntasRestantes.length === 0) {
        doenca = 'Desconhecida';
        mostrarResultado();
        return;
    }

    let respostas = perguntasRestantes.map(pergunta => {
        return dados.reduce((acc, curr) => acc + Number(curr[pergunta]), 0);
    });

    let perguntaRodada = perguntasRestantes[respostas.indexOf(Math.max(...respostas))];
    perguntasFeitas.push(perguntaRodada);

    document.getElementById('question').textContent = `${perguntaRodada}?`;
    document.getElementById('question-container').classList.remove('hidden');
}

function handleResponse(resposta) {
    let perguntaRodada = perguntasFeitas[perguntasFeitas.length - 1];

    if (resposta === 'S') {
        dados = dados.filter(row => Number(row[perguntaRodada]) === 1);
    } else if (resposta === 'N') {
        dados = dados.filter(row => Number(row[perguntaRodada]) === 0);
    }

    perguntasRestantes = perguntasRestantes.filter(pergunta => pergunta !== perguntaRodada);

    mostrarProximaPergunta();
}

function mostrarResultado() {
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('question-container2').classList.remove('hidden');
    document.getElementById('result').textContent = `Com base nas respostas das perguntas sobre os seus sintomas foi comprovado que a doença é: ${doenca}`;
    document.getElementById('result-container').classList.remove('hidden');
}

function criarLink() {
    const link = document.getElementById('link-doenca');
    link.href = `https://www.einstein.br/doencas-sintomas/${doenca}`;
}

//API GoogleMaps gerar mapa com os hospitais próximos ao meu endereço

let map;
let service;
let infowindow;

function initMap() {
    console.log("Inicializando mapa...");
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            console.log("Localização do usuário obtida:", userLocation);

            map = new google.maps.Map(document.getElementById('map'), {
                center: userLocation,
                zoom: 15
            });

            infowindow = new google.maps.InfoWindow();

            let request = {
                location: userLocation,
                radius: '5000', // Raio de busca em metros
                type: ['hospital', 'doctor', 'health', 'pharmacy', 'clinic']
            };

            service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, callback);
        }, function(error) {
            console.error("Erro ao obter localização:", error);
            alert("Erro ao obter localização. Verifique as permissões de geolocalização.");
        });
    } else {
        alert("Geolocalização não é suportada pelo seu navegador.");
    }
}

function callback(results, status) {
    console.log("Resultados da busca:", results);
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    } else {
        console.error("Erro na busca de locais:", status);
        alert("Erro na busca de locais: " + status);
    }
}

function createMarker(place) {
    let placeLoc = place.geometry.location;
    let marker = new google.maps.Marker({
        map: map,
        position: placeLoc
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

// Função JavaScript para mudar a página

function mudarPagina() {
    window.location.href = "http://127.0.0.1:5500/index.html";  // Substitua pelo URL desejado
}