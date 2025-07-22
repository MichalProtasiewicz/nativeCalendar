import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import React, { useState, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View, Alert } from "react-native";
import { ThemedText } from "../ThemedText";
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import CalendarDay, { MonthDay, DayFormat } from './CalendarDay'; 

dayjs.extend(isoWeek);

export interface WeekViewProps {
  from: dayjs.Dayjs;
  offerDays: string[];
  orderDays: string[];
}

export default function MonthView({
  from,
  orderDays,
  offerDays,
}: WeekViewProps) {
  const [width, setWidth] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(dayjs(from));
  const [selectedDay, setSelectedDay] = useState<MonthDay | null>(null);
  const theme = useColorScheme() ?? 'light';

  useEffect(() => {
    setCurrentMonth(dayjs(from));
    setSelectedDay(null);
  }, [from]);

  const monthStart = currentMonth.startOf("month");
  const monthEnd = currentMonth.endOf("month");

  const firstMonday = monthStart.startOf("isoWeek");
  const lastSunday = monthEnd.endOf("isoWeek");

  const days: MonthDay[] = useMemo(() => {
    let day = firstMonday;
    const allDays: MonthDay[] = [];

    while (day.isBefore(lastSunday) || day.isSame(lastSunday, "day")) {
      allDays.push({
        day: day.format("DD"),
        date: day.format(DayFormat),
        today: day.isSame(dayjs(), "day"),
        offer: offerDays.includes(day.format(DayFormat)),
        order: orderDays.includes(day.format(DayFormat)),
        isCurrentMonth: day.isSame(currentMonth, "month"),
      });
      day = day.add(1, "day");
    }
    return allDays;
  }, [currentMonth, offerDays, orderDays, firstMonday, lastSunday]);

  const weeks: MonthDay[][] = useMemo(() => {
    const groupedWeeks: MonthDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      groupedWeeks.push(days.slice(i, i + 7));
    }
    return groupedWeeks;
  }, [days]);


  const weekDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, "month"));
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, "month"));
    setSelectedDay(null);
  };

  const handleDayPress = (dayData: MonthDay) => {
    setSelectedDay(dayData);
  };

  const handleOrderPress = async () => {
    if (selectedDay) {
      console.log(selectedDay)
      try {
        const response = await fetch('https://example.com/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: selectedDay.date,
          }),
        });
  
        if (!response.ok) {
          const errorBody = await response.text();
          console.error("Odpowiedź serwera (błąd):", errorBody);
          throw new Error(`Błąd serwera (Status: ${response.status}): ${errorBody.substring(0, 100)}...`);
        }
  
        const responseData = await response.json();
        Alert.alert(
          "Sukces!",
          `Zamówienie na dzień ${dayjs(selectedDay.date).format("DD MMMM YYYY")} zostało wysłane. Odpowiedź serwera: ${JSON.stringify(responseData)}`
        );
  
        setSelectedDay(null);
  
      } catch (error: any) {
        Alert.alert(
          "Błąd zamówienia",
          `Wystąpił problem podczas wysyłania zamówienia: ${error.message}`
        );
        console.error("Błąd wysyłania zamówienia:", error);
      }
    }
  };

  return (
    <View
      style={styles.days}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {/* Month and year header with navigation */}
      <View style={styles.monthHeader}>
        <Pressable onPress={handlePrevMonth} style={styles.monthNavButton} accessibilityLabel="Poprzedni miesiąc">
          <ThemedText style={[styles.monthNavText, { color: Colors[theme].tint }]}>{"<"}</ThemedText>
        </Pressable>
        <ThemedText style={[styles.monthTitle, { color: Colors[theme].tint }]}>
          {monthStart.format("MMMM YYYY")}
        </ThemedText>
        <Pressable onPress={handleNextMonth} style={styles.monthNavButton} accessibilityLabel="Następny miesiąc">
          <ThemedText style={[styles.monthNavText, { color: Colors[theme].tint }]}>{">"}</ThemedText>
        </Pressable>
      </View>
      {/* Week day header */}
      <View style={styles.weekHeader}>
        {weekDayNames.map((dayName) => (
          <View
            key={dayName}
            style={{
              width: width / 7,
              padding: 2,
            }}
          >
            <ThemedText style={styles.weekDayName}>{dayName[0]}</ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <View key={`week-${week[0]?.date || weekIndex}`} style={styles.weekRow}>
          {week.map((d) => (
            <CalendarDay
              key={d.date}
              dayData={d}
              width={width}
              onPress={handleDayPress}
              isSelected={selectedDay?.date === d.date}
              theme={theme}
            />
          ))}
        </View>
      ))}

      {selectedDay && (
        <View style={styles.dayDetailsContainer}>
          <ThemedText style={styles.dayDetailsTitle}>
            Szczegóły dla: {dayjs(selectedDay.date).format("DD MMMM YYYY")}
          </ThemedText>
          <ThemedText>
            Dostępna oferta:{' '}
            <ThemedText style={{ fontWeight: 'bold' }}>
              {selectedDay.offer ? 'Tak' : 'Nie'}
            </ThemedText>
          </ThemedText>
          <ThemedText>
            Dzień zamówienia:{' '}
            <ThemedText style={{ fontWeight: 'bold' }}>
              {selectedDay.order ? 'Tak' : 'Nie'}
            </ThemedText>
          </ThemedText>

          {selectedDay.isCurrentMonth && selectedDay.offer && (
            <Pressable
              style={[styles.orderButton, { backgroundColor: Colors[theme].tint }]}
              onPress={handleOrderPress}
              accessibilityLabel="Zamów"
            >
              <ThemedText style={styles.orderButtonText}>Zamów</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  days: {
    marginVertical: 2,
    marginHorizontal: 2,
    alignSelf: 'stretch',
  },
  weekHeader: {
    flexDirection: 'row',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekDayName: {
    textAlign: 'center',
    color: '#aaa',
    fontFamily: 'poppins-bold',
    textTransform: 'uppercase',
    fontSize: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    marginTop: 2,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    textAlign: 'center',
    flex: 1,
    fontFamily: 'poppins-bold',
    textTransform: 'capitalize',
  },
  monthNavButton: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  monthNavText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayDetailsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  dayDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});