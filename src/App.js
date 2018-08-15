import React, { Component } from 'react';
import './App.css';
import request from 'superagent';


class App extends Component {
  constructor(){
    super();

    this.state = {
      cities: [],
      show: false,
      city: {},
      country: '',
      temperature: '',
      pressure: '',
      wind: '',
      week: [],
      cities: []
    }
  }

  checkBtn = (e) => {
    e.preventDefault();
    this.setState({
      checked: true
    })
  }

  updateInput = (e) => {
    e.preventDefault();
    const value = this.refs.inputLocation.value;
    if (value !== '') {
      const newState = this.state;
      newState.city = {id: this.state.cities.length + 1, name: value.replace(value[0], value[0].toUpperCase())};
      this.setState(newState);
      newState.cities.push(newState.city);
      newState.checked = false;
      this.setState(newState);
    }
  }

  getDayOfWeek = (dayOfWeek) => {
    const weekday=new Array(7);
    weekday[0]="Sunday";
    weekday[1]="Monday";
    weekday[2]="Tuesday";
    weekday[3]="Wednesday";
    weekday[4]="Thursday";
    weekday[5]="Friday";
    weekday[6]="Saturday";

    return weekday[dayOfWeek.getDay()].slice(0, 3);
  }

  checkIcon = (icon) => {
    if ( icon === 'partly-cloudy-day') {
      return 'cloudy';
    } else if ( icon === 'clear-day') {
      return 'sunny';
    } else if ( icon === 'partly-cloudy-night') {
      return 'sunny';
    } else {
      return icon;
    }
  }

  weather = (location) => {
     const API_URL = `https://api.darksky.net/forecast/7b99d5e089197748e933189d8174655f/${location.lat},${location.lng}`;

     request
        .get(API_URL)
        .then(response => { 
          const dailyWeather = response.body.daily.data;
          this.setState({
            week: []
          })
          dailyWeather.forEach(day => {
            const dayOfWeek = new Date(day.time * 1000);
            this.setState({
              week: [ 
                ...this.state.week,
                {
                  day: this.getDayOfWeek(dayOfWeek),
                  date: dayOfWeek.toLocaleDateString(), 
                  icon: this.checkIcon(day.icon), 
                  pressure: day.pressure, 
                  temperature: day.temperatureMin, 
                  wind: day.windSpeed
                }
              ], 
            });

          })
        });
  }  
  
  getWeather = (e) => {
    e.preventDefault();
    const country = e.target.innerText;
    const API_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${country}`;

    request
      .get(API_URL)
      .then(response => {
        const location = response.body.results[0].geometry.location;
        return location;
      })
      .then(this.weather)
      .catch(error => {
        this.setState({
          country: 'N/A',
          show: false
        });
      });
    this.setState({
      show: true,
      country: country
    });
   }


  render() {
    const cities = this.state.cities;
    const week = this.state.week;
    return (
      <div className='app'>
        <header className='app__header'>
          <button className='app__add' onClick={ this.checkBtn }>
            <i className="fa fa-plus-circle"></i> New City
          </button>
        </header>
        <div className='grid'>
          <aside className='app__aside'>
            <h1 className='app__title'>All countries</h1>
            {cities.map((city, i) => {  
              return <a key={ i } href='#' onClick={ this.getWeather } className='app__country'>{ city.name }</a>
            })}
            { this.state.checked &&
              <form onSubmit={ this.updateInput }> 
                <input autoFocus type='text' ref="inputLocation" placeholder='Location' className='app__input' />
              </form>
            }
          </aside>
          <section className='app__view'>
               <p className='app__view__title'>{ this.state.country } Daily Weather</p>
               { this.state.show &&
                 <div className="app__view__daily">
                  {week.map((day, i) => { 
                      return   <div key={ i } className='app__view__data'>
                                  <h5>{ day.day }</h5>
                                  <p>{ day.date }</p>
                                  <i className={`wi wi-day-${day.icon}`}></i>
                                  <ul>
                                    <li className="span-data">Temp. <strong>{ day.temperature }</strong> </li>
                                    <li className="span-data">Pres. <strong>{ day.pressure }</strong> </li>
                                    <li className="span-data">Wind: <strong>{ day.wind }</strong> </li>
                                  </ul>
                               </div>
                  })}
                 </div>
               }
          </section>
  
        </div>
      </div>
    );
  }
}

export default App;
