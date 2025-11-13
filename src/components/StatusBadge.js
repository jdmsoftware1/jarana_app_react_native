import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import colors from '../theme/colors';
import { spacing } from '../theme/theme';

const StatusBadge = ({ status, label }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
        return { bg: colors.successLight, text: colors.success };
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return { bg: colors.errorLight, text: colors.error };
      case 'pending':
        return { bg: colors.warningLight, text: colors.warning };
      default:
        return { bg: colors.gray[100], text: colors.gray[600] };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
      <Text style={[styles.text, { color: statusStyle.text }]}>
        {label || status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusBadge;
