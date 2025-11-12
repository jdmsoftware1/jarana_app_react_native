import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { spacing, shadows } from '../theme/theme';

const Card = ({ children, style, onPress, elevated = true }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.card,
        elevated && shadows.md,
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});

export default Card;
