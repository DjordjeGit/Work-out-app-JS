'use strict';

class Workout {
  date = new Date();
  id = Date.now() + ''.slice(-10);
  const(cords, duration, distance) {
    this.cords = cords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDiscription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.dicription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(cords, duration, distance, cadance) {
    super(cords, duration, distance);
    this.cords = cords;
    this.duration = duration;
    this.distance = distance;
    this.cadance = cadance;
    this._setDiscription();
    this._pace();
  }
  _pace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(cords, duration, distance, elevationGain) {
    super(cords, duration, distance);
    this.cords = cords;
    this.duration = duration;
    this.distance = distance;
    this.elevationGain = elevationGain;
    this._setDiscription();
    this._speed();
  }
  _speed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const reset = document.querySelector('.btn__reset');
class App {
  map;
  workEvent;
  workOuts = [];
  zoomlevel = 13;
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleTypes);
    containerWorkouts.addEventListener('click', this._moveToWorkout.bind(this));
    reset.addEventListener('click', this.reset.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          console.log(`faild to load map`);
        }
      );
  }

  _loadMap(pos) {
    const { latitude, longitude } = pos.coords;
    const coords1 = [latitude, longitude];

    this.map = L.map('map').setView(coords1, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    L.marker(coords1)
      .addTo(this.map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();
    this.map.on('click', this._displayForm.bind(this));
    this.workOuts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _displayForm(mapE) {
    console.log(mapE);
    this.workEvent = mapE;
    inputDistance.focus();
    form.classList.remove('hidden');
    console.log(this.workEvent);
  }

  _hiddeForm() {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }

  _newWorkout(e) {
    e.preventDefault();
    const isNumber = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const isPositive = (...inputs) => inputs.every(inp => inp > 0);
    let workout;
    const { lat, lng } = this.workEvent.latlng;
    const coords2 = [lat, lng];
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    console.log(type, distance, duration);
    if (type === 'running') {
      const cadance = +inputCadence.value;
      if (
        !isPositive(distance, duration, cadance) ||
        !isNumber(distance, duration, cadance)
      )
        return alert(`You need to input positive number.`);
      workout = new Running(coords2, duration, distance, cadance);
    }
    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      if (
        !isPositive(distance, duration, elevationGain) ||
        !isNumber(distance, duration)
      )
        return alert(`You need to input positive number.`);
      workout = new Cycling(coords2, duration, distance, elevationGain);
    }
    console.log(workout);
    this.workOuts.push(workout);
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
    this._hiddeForm();
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workaut) {
    L.marker(workaut.cords)
      .addTo(this.map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 150,
          autoClose: false,
          closeOnClick: false,
          className: `${workaut.type}-popup`,
        })
      )
      .setPopupContent(`${workaut.dicription}`)
      .openPopup();

    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';
  }

  _renderWorkout(workaut) {
    let html = `<li class="workout workout--${workaut.type}" data-id="${
      workaut.id
    }">
    <h1 class="workout__title">${workaut.dicription}</h1>
    <div class="workout__details">
      <span class="workout__icon">${
        workaut.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span
      ><span class="workout__value">${workaut.distance}</span
      ><span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span
      ><span class="workout__value">${workaut.duration}</span
      ><span class="workout__unit">min</span>
    </div>`;
    if (workaut.type === 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span
      ><span class="workout__value">${workaut.cadance}</span
      ><span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span
      ><span class="workout__value">${workaut.pace}</span
      ><span class="workout__unit">stp</span>
    </div>
  </li>`;
    }
    if (workaut.type === 'cycling') {
      html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span
    ><span class="workout__value">${workaut.speed}</span
    ><span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span
    ><span class="workout__value">${workaut.elevationGain}</span
    ><span class="workout__unit">meters</span>
  </div>
</li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _toggleTypes() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _moveToWorkout(e) {
    const wokoutEl = e.target.closest('.workout');
    if (!wokoutEl) return;
    console.log(`${wokoutEl.dataset.id}`);
    const work = this.workOuts.find(f => f.id === wokoutEl.dataset.id);
    this.map.setView(work.cords, this.zoomlevel, {
      pan: {
        animate: true,
        duration: 1.8,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.workOuts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.workOuts = data;
    this.workOuts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
