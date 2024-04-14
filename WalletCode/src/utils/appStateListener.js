import React, {Component} from 'react';
import {AppState} from 'react-native';
import turnOFFSound from '../assets/turnOff.mp3';
import turnONSound from '../assets/turnOn.mp3';
import {navigationHOC} from './navigationHOC';
import ContextModule from './contextModule';

const volume = 0.5;

class AppStateListener extends Component {
  constructor(props) {
    super(props);
    this.listener = AppState.addEventListener(
      'change',
      this._handleAppStateChange,
    );
    this.Sound = require('react-native-sound');
    this.turnOFF = new this.Sound(turnOFFSound);
    this.turnON = new this.Sound(turnONSound);
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.turnOFF.setVolume(volume);
    this.turnON.setVolume(volume);
    this.Sound.setCategory('Playback');
    this.turnON.play();
  }

  componentWillUnmount() {
    this.listener.remove();
  }

  _handleAppStateChange = nextAppState => {
    console.log('nextAppState', nextAppState);
    if (nextAppState === 'background') {
      this.turnOFF.play();
    }
    if (nextAppState === 'active') {
      this.turnON.play();
    }
  };

  render() {
    return <></>;
  }
}

export default navigationHOC(AppStateListener);
