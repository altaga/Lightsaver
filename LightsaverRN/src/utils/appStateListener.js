import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {AppState} from 'react-native';
import turnOFFSound from '../assets/turnOff.mp3';
import {navigationHOC} from './navigationHOC';
import ContextModule from './contextModule';

class AppStateListener extends Component {
  constructor(props) {
    super(props);
    this.listener = AppState.addEventListener(
      'change',
      this._handleAppStateChange,
    );
    reactAutobind(this);
    this.Sound = require('react-native-sound');
    this.turnOFF = new this.Sound(turnOFFSound);
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.turnOFF.setVolume(0.5);
    this.Sound.setCategory('Playback');
  }

  componentWillUnmount() {
    this.listener.remove();
  }

  _handleAppStateChange = nextAppState => {
    console.log('nextAppState', nextAppState);
    if (
      nextAppState === 'background' &&
      this.context.value.page !== 'CardPayment'
    ) {
      this.turnOFF.play();
      this.props.navigation.navigate('Lock');
    }
  };

  render() {
    return <></>;
  }
}

export default navigationHOC(AppStateListener);
