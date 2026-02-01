/**
 * Mock 모드 관리
 * localStorage 기반으로 Mock 모드를 켜고 끌 수 있음
 */

export function isMockMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('MOCK_MODE') === 'true';
}

export function enableMockMode(): void {
  localStorage.setItem('MOCK_MODE', 'true');
}

export function disableMockMode(): void {
  localStorage.removeItem('MOCK_MODE');
}
