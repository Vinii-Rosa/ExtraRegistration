import { describe, expect, test } from '@jest/globals';
import { calculateExtraValue, calculateMinutes } from '../../utils/calculate_extra_value.js';

describe('calculateExtraValue', () => {
  test('Calculando 2 horas a R$ 60 por hora', () => {
    expect(calculateExtraValue('18:00', '20:00', 60)).toBe(120);
  });

  test('Calculando minutos quebrados', () => {
    expect(calculateExtraValue('18:00', '20:30', 60)).toBe(150);
  });

  test('Arredondando para o real inteiro mais próximo', () => {
    expect(calculateExtraValue('18:00', '18:20', 50)).toBe(17);
    expect(calculateExtraValue('18:00', '18:10', 50)).toBe(8);
  });

  test('Fim antes do início vira o dia', () => {
    expect(calculateExtraValue('23:00', '01:00', 60)).toBe(120);
  });
});

describe('calculateMinutes', () => {
  test('Calculando a duração em minutos', () => {
    expect(calculateMinutes('18:00', '20:00')).toBe(120);
    expect(calculateMinutes('18:00', '20:30')).toBe(150);
  });

  test('Fim antes do início vira o dia', () => {
    expect(calculateMinutes('23:00', '01:00')).toBe(120);
    expect(calculateMinutes('23:30', '00:15')).toBe(45);
  });
});
