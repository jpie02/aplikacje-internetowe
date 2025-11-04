const API_KEY = "250597f3c790673703e46b7bd606b2f5";
const btn = document.getElementById("weatherBtn");

btn.onclick = function () {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Wpisz nazwę miasta!");
        return;
    }

    getCurrentWeather(city);
    getForecast(city);
};

function getCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;

    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);

    xhr.onload = function () {
        const box = document.getElementById("currentWeather");

        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);

            console.log("Current Weather API:", data);

            box.innerHTML = `
                <h2>Pogoda teraz: ${data.name}</h2>
                <p>Temperatura: ${data.main.temp}°C</p>
                <p>Odczuwalna: ${data.main.feels_like}°C</p>
                <p>Wilgotność: ${data.main.humidity}%</p>
                <p>Warunki: ${data.weather[0].description}</p>
            `;
        } else {
            box.innerHTML = `<p class="error">Nie znaleziono miasta</p>`;
        }
    };

    xhr.send();
}

function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Nie znaleziono miasta");
            return res.json();
        })
        .then(data => {
            let html = `<h2>Prognoza 5-dniowa:</h2><ul>`;

            // API zwraca dane co 3h, czyli co 8 rekordów == co 24h
            for (let i = 0; i < data.list.length; i += 8) {
                const item = data.list[i];

                console.log("Forecast API:", data.list[i]);
                html += `
                    <li>
                        <strong>${item.dt_txt}</strong><br>
                        Temp: ${item.main.temp}°C<br>
                        ${item.weather[0].description}
                    </li>
                `;
            }
            html += `</ul>`;
            document.getElementById("forecast").innerHTML = html;
        })
        .catch(err => {
            document.getElementById("forecast").innerHTML =
                `<p class="error">${err.message}</p>`;
        });
}
