import React, {Component} from 'react';
import {Dimensions, StyleSheet} from 'react-native';

import RNSpeedometer from 'react-native-speedometer';

export class GaugeChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <RNSpeedometer
        size={Dimensions.get('screen').width / 3}
        value={this.props.value}
        defaultValue={600}
        minValue={300}
        maxValue={850}
        labels={[
          {
            name: 'Initiate (Poor)',
            labelColor: '#ff2900',
            activeBarColor: '#ff2900',
          },
          {
            name: 'Padawan (Fair)',
            labelColor: '#f4ab44',
            activeBarColor: '#f4ab44',
          },
          {
            name: 'Knight (Good)',
            labelColor: '#f2cf1f',
            activeBarColor: '#f2cf1f',
          },
          {
            name: 'Master (Very Good)',
            labelColor: '#14eb6e',
            activeBarColor: '#14eb6e',
          },
          {
            name: 'Grandmaster (Exceptional)',
            labelColor: '#00ff6b',
            activeBarColor: '#00ff6b',
          },
        ]}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInput: {
    borderBottomWidth: 0.3,
    borderBottomColor: 'black',
    height: 25,
    fontSize: 16,
    marginVertical: 50,
    marginHorizontal: 20,
  },
});
