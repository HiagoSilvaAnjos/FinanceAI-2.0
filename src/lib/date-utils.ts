export const BRAZIL_TIMEZONE = "America/Sao_Paulo";

/**
 * Obtém a data atual no fuso horário do Brasil
 */
export function getBrazilDate(): Date {
  const now = new Date();
  const brazilTime = new Date(
    now.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }),
  );
  return brazilTime;
}

/**
 * Converte uma data para o timezone do Brasil
 */
export function toBrazilDate(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }));
}

/**
 * Cria uma data no início do dia no timezone do Brasil
 */
export function createBrazilStartOfDay(date?: Date): Date {
  const targetDate = date || getBrazilDate();
  const brazilDate = toBrazilDate(targetDate);

  // Criar data no início do dia (00:00:00) no timezone do Brasil
  const startOfDay = new Date(
    brazilDate.getFullYear(),
    brazilDate.getMonth(),
    brazilDate.getDate(),
    0,
    0,
    0,
    0,
  );
  return startOfDay;
}

/**
 * Cria uma data no final do dia no timezone do Brasil
 */
export function createBrazilEndOfDay(date?: Date): Date {
  const targetDate = date || getBrazilDate();
  const brazilDate = toBrazilDate(targetDate);

  // Criar data no final do dia (23:59:59) no timezone do Brasil
  const endOfDay = new Date(
    brazilDate.getFullYear(),
    brazilDate.getMonth(),
    brazilDate.getDate(),
    23,
    59,
    59,
    999,
  );
  return endOfDay;
}

/**
 * Formata data para exibição considerando o timezone do Brasil
 */
export function formatBrazilDate(date: Date): string {
  const brazilDate = toBrazilDate(date);
  const today = getBrazilDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Criar datas de comparação sem hora
  const todayStart = createBrazilStartOfDay(today);
  const yesterdayStart = createBrazilStartOfDay(yesterday);
  const dateStart = createBrazilStartOfDay(date);

  // Comparar apenas as datas
  if (dateStart.getTime() === todayStart.getTime()) {
    return "Hoje";
  } else if (dateStart.getTime() === yesterdayStart.getTime()) {
    return "Ontem";
  } else {
    // Verificar se é do ano atual
    const currentYear = today.getFullYear();
    const dateYear = brazilDate.getFullYear();

    if (dateYear === currentYear) {
      // Ano atual - mostrar sem o ano
      return brazilDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        timeZone: BRAZIL_TIMEZONE,
      });
    } else {
      // Ano diferente - mostrar com o ano
      return brazilDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: BRAZIL_TIMEZONE,
      });
    }
  }
}

/**
 * Formata data completa para headers considerando o timezone do Brasil
 */
export function formatBrazilDateFull(date: Date): string {
  const brazilDate = toBrazilDate(date);
  const today = getBrazilDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Criar datas de comparação sem hora
  const todayStart = createBrazilStartOfDay(today);
  const yesterdayStart = createBrazilStartOfDay(yesterday);
  const dateStart = createBrazilStartOfDay(date);

  if (dateStart.getTime() === todayStart.getTime()) {
    return "Hoje";
  } else if (dateStart.getTime() === yesterdayStart.getTime()) {
    return "Ontem";
  } else {
    // Formato completo com ano
    return brazilDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: BRAZIL_TIMEZONE,
    });
  }
}

/**
 * Obtém data formatada para uso em inputs de data (YYYY-MM-DD) no timezone do Brasil
 */
export function getBrazilDateString(date?: Date): string {
  const targetDate = date || getBrazilDate();
  const brazilDate = toBrazilDate(targetDate);

  const year = brazilDate.getFullYear();
  const month = String(brazilDate.getMonth() + 1).padStart(2, "0");
  const day = String(brazilDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Parse de string de data considerando timezone do Brasil
 */
export function parseBrazilDateString(dateString: string): Date {
  // Se a data vier no formato YYYY-MM-DD, criar no timezone do Brasil
  const [year, month, day] = dateString.split("-").map(Number);

  // Criar a data no timezone do Brasil
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);

  return date;
}
