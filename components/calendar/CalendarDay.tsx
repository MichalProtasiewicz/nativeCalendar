import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText'; 
import { Colors } from '@/constants/Colors'; 

export interface MonthDay {
  day: string;
  date: string;
  today: boolean;
  offer: boolean;
  order: boolean;
  isCurrentMonth: boolean;
}

interface CalendarDayProps {
  dayData: MonthDay;
  width: number;
  onPress: (dayData: MonthDay) => void;
  isSelected: boolean;
  theme: 'light' | 'dark';
}

export const DayFormat = "YYYY-MM-DD";

export default function CalendarDay({
  dayData,
  width,
  onPress,
  isSelected,
  theme,
}: CalendarDayProps) {
  return (
    <View
      style={{
        width: width / 7,
        padding: 1,
      }}
      key={dayData.date}
    >
      <Pressable
        onPress={() => onPress(dayData)}
        style={{
          ...styles.touchableBox,
          ...(dayData.offer || !dayData.isCurrentMonth ? {} : styles.noOfferDay),
          ...(dayData.isCurrentMonth ? {} : styles.otherMonthDay),
          ...(isSelected ? styles.selectedDayHighlight : {}),
          ...(dayData.today && dayData.isCurrentMonth ? styles.todayBackground : {}),
        }}
        accessibilityLabel={`Dzień ${dayData.day}`}
      >
        <View style={styles.dayBox}>
          {dayData.isCurrentMonth && (
            <ThemedText
              style={{
                ...styles.dayText,
                ...(dayData.today ? { fontWeight: 'bold', color: Colors[theme].tint } : {}),
                ...(dayData.isCurrentMonth ? {} : styles.otherMonthText),
              }}
            >
              {dayData.day}
            </ThemedText>
          )}
          {dayData.offer && (
            <View
              style={[
                styles.status,
                { backgroundColor: Colors[theme].tint },
                styles.offerIndicator,
              ]}
            />
          )}
          {dayData.order && (
            <View
              style={[
                styles.status,
                { backgroundColor: Colors[theme].text },
                styles.orderIndicator,
              ]}
            />
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    position: 'absolute',
    borderRadius: 5,
    width: 8,
    aspectRatio: 1,
  },
  offerIndicator: {
    top: 3,
    right: 3,
  },
  orderIndicator: {
    bottom: 3,
    right: 3,
  },
  touchableBox: {
    backgroundColor: '#f6f6f6',
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f6f6f6',
    justifyContent: 'center',
  },
  dayBox: {
    justifyContent: 'center',
    marginHorizontal: 0,
    position: 'relative',
  },
  dayText: {
    textAlign: 'center',
    fontSize: 13,
  },
  todayBackground: {
    borderWidth: 1,
    borderRadius: 4,
  },
  otherMonthDay: {
    backgroundColor: '#f0f0f0',
    borderColor: '#f0f0f0',
    opacity: 0.4,
  },
  noOfferDay: {
    opacity: 0.4,
  },
  otherMonthText: {
    color: '#ccc',
  },
  selectedDayHighlight: {
    borderColor: 'blue',
    borderWidth: 2,
  },
});