// /assets/calendar.js

const CLIENT_ID = "713086940971-22pe01cvfdhdremi6s1pt3b84th4lq64.apps.googleusercontent.com"; // 
const API_KEY = "AIzaSyDZMOcCc_6tlRXnmelrTTup5VjjzgPpAkM";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
const CALENDAR_ID = "pres.intelectta@gmail.com"; // ou ID do calendário privado

// Botões de login/logout
const root = document.getElementById("root");
root.innerHTML += `
  <div id="calendar-auth">
    <button id="authorize_button">🔑 Autorizar</button>
    <button id="signout_button" style="display:none">🚪 Sair</button>
  </div>
  <div id="events"></div>
`;

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Load GAPI
function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

// Init GAPI Client
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
  });
  gapiInited = true;
  maybeEnableButtons();
}

// Init OAuth
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // será definido no login
  });
  gisInited = true;
  maybeEnableButtons();
}

// Ativa botão se tudo pronto
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("authorize_button").style.display = "block";
  }
}

// Botão login
document.getElementById("authorize_button").onclick = () => {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    document.getElementById("signout_button").style.display = "block";
    document.getElementById("authorize_button").style.display = "none";
    await listUpcomingEvents();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    tokenClient.requestAccessToken({ prompt: "" });
  }
};

// Botão logout
document.getElementById("signout_button").onclick = () => {
  gapi.client.setToken("");
  document.getElementById("authorize_button").style.display = "block";
  document.getElementById("signout_button").style.display = "none";
  document.getElementById("events").innerHTML = "";
};

// Lista eventos
async function listUpcomingEvents() {
  let response;
  try {
    response = await gapi.client.calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    });
  } catch (err) {
    document.getElementById("events").innerText = err.message;
    return;
  }

  const events = response.result.items;
  if (!events || events.length == 0) {
    document.getElementById("events").innerText = "Nenhum evento encontrado.";
    return;
  }

  document.getElementById("events").innerHTML =
    "<h2>📅 Próximos eventos</h2><ul>" +
    events
      .map((ev) => {
        const start = ev.start.dateTime || ev.start.date;
        return `<li><b>${ev.summary}</b> <br><small>${start}</small></li>`;
      })
      .join("") +
    "</ul>";
}

// Carregadores do Google
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;
