import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

const TabButton = ({ children, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={styles.container}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: 20,
  },
});

export default TabButton;
