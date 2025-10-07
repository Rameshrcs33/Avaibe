import React from 'react';
import { StyleSheet, View } from 'react-native';
import LensRecorder from './screen/LensRecorder';

const App = () => {
  return (
    <View style={styles.container}>
      <LensRecorder />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
