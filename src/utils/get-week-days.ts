export function getWeekDays() {
  const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })

  function createArrayToDateWeek() {
    return Array.from(Array(7).keys())
  }

  function formatterToDate(day: number) {
    return formatter.format(new Date(Date.UTC(2021, 5, day)))
  }

  function formatStringByWeekDay(weekDay: string) {
    return weekDay.substring(0, 1).toUpperCase().concat(weekDay.substring(1))
  }

  return createArrayToDateWeek().map(formatterToDate).map(formatStringByWeekDay)
}
