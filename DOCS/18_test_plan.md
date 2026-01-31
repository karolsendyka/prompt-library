# Plan Testów: Corporate Prompt Library MVP

## 1. Wprowadzenie i Cele Testowania

Niniejszy dokument przedstawia kompleksowy plan testów dla projektu Minimum Viable Product (MVP) "Corporate Prompt Library". Głównym celem testowania jest zapewnienie wysokiej jakości, niezawodności, bezpieczeństwa i użyteczności aplikacji, która ma służyć jako scentralizowana biblioteka promptów dla inżynierów.

**Główne cele testowania:**

*   Weryfikacja, czy wszystkie kluczowe funkcjonalności MVP działają zgodnie z wymaganiami.
*   Zapewnienie stabilności i wydajności aplikacji pod obciążeniem.
*   Identyfikacja i eliminacja defektów.
*   Weryfikacja poprawności działania mechanizmów bezpieczeństwa (uwierzytelnianie, autoryzacja).
*   Potwierdzenie zgodności z projektem UI/UX i responsywności na różnych urządzeniach.

## 2. Zakres Testów

Zakres testów obejmuje wszystkie funkcjonalności i komponenty zdefiniowane dla MVP, w tym:

*   **Funkcjonalności Użytkownika:**
    *   Rejestracja i logowanie użytkowników.
    *   Wyszukiwanie i filtrowanie promptów.
    *   Wyświetlanie szczegółów promptu.
    *   Kopiowanie promptu do schowka.
    *   Głosowanie (upvoting) na prompt.
*   **Funkcjonalności Administratora/Twórcy Promptów:**
    *   Tworzenie nowych promptów.
    *   Usuwanie promptów.
*   **Interfejs Użytkownika (UI):**
    *   Responsywność i spójność wizualna na różnych urządzeniach i przeglądarkach.
    *   Poprawność wyświetlania wszystkich elementów UI.
*   **Integracja z Supabase:**
    *   Poprawność operacji CRUD na bazie danych.
    *   Działanie uwierzytelniania i autoryzacji (RLS).
*   **Bezpieczeństwo:**
    *   Testy autoryzacji dostępu do danych (RLS).
    *   Odporność na typowe ataki (np. XSS, SQL Injection – w zakresie interfejsu API).
*   **Wydajność:**
    *   Czas ładowania stron i odpowiedzi API.

## 3. Typy Testów do Przeprowadzenia

Planowane są następujące typy testów:

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja najmniejszych, izolowanych jednostek kodu (funkcji, metod, komponentów React).
    *   **Zakres:** Logika biznesowa w endpointach API, komponenty React (bez głębokiej interakcji z API), funkcje pomocnicze.
    *   **Narzędzia:** Vitest, React Testing Library.
*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja interakcji między różnymi modułami lub komponentami (np. komponent React z API, API z bazą danych).
    *   **Zakres:** Endpointy API (np. testy `src/pages/api/prompts.integration.test.ts`), usługi i repozytoria (np. `prompt.service.ts`, `prompt.repository.ts`), interakcje Astro z komponentami React, uwierzytelnianie i autoryzacja z Supabase.
    *   **Narzędzia:** Vitest, Supertest (dla API).
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Symulowanie rzeczywistych scenariuszy użytkownika w kompletnym systemie.
    *   **Zakres:** Pełne przepływy użytkownika, takie jak rejestracja -> logowanie -> tworzenie promptu -> wyszukiwanie -> głosowanie.
    *   **Narzędzia:** Cypress lub Playwright.
*   **Testy Bezpieczeństwa (Security Tests):**
    *   **Cel:** Identyfikacja luk bezpieczeństwa i weryfikacja mechanizmów autoryzacji.
    *   **Zakres:** Testowanie RLS w Supabase, autoryzacji dostępu do zasobów (prompty, dane użytkownika), podatności na typowe ataki webowe (np. walidacja wejścia w formularzach).
    *   **Narzędzia:** Manualne testy penetracyjne, zautomatyzowane skanery bezpieczeństwa (jeśli dostępne).
*   **Testy Wydajności (Performance Tests):**
    *   **Cel:** Ocena responsywności i stabilności systemu pod różnym obciążeniem.
    *   **Zakres:** Czas ładowania kluczowych stron (lista promptów, szczegóły promptu), czas odpowiedzi API dla operacji CRUD i wyszukiwania.
    *   **Narzędzia:** Artillery, k6 lub Lighthouse.
*   **Testy Użyteczności (Usability Tests):**
    *   **Cel:** Ocena łatwości obsługi i intuicyjności interfejsu.
    *   **Zakres:** Przeprowadzenie testów z udziałem użytkowników docelowych (inżynierów).
    *   **Narzędzia:** Ankiety, obserwacje użytkowników.
*   **Testy Wizualnej Regresji (Visual Regression Tests):**
    *   **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie UI.
    *   **Zakres:** Kluczowe widoki i komponenty, weryfikacja spójności stylów Tailwind CSS.
    *   **Narzędzia:** Storybook ze wtyczkami do wizualnej regresji lub narzędzia E2E z funkcjami porównywania zrzutów ekranu.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

Poniżej przedstawiono przykładowe scenariusze testowe dla najważniejszych funkcjonalności:

### Uwierzytelnianie i Autoryzacja

*   **TC-AUTH-001:** Pomyślna rejestracja nowego użytkownika.
*   **TC-AUTH-002:** Pomyślne logowanie istniejącego użytkownika.
*   **TC-AUTH-003:** Logowanie z niepoprawnymi danymi (adres e-mail/hasło).
*   **TC-AUTH-004:** Próba dostępu do chronionych zasobów bez uwierzytelnienia (powinno zwrócić błąd 401/403).
*   **TC-AUTH-005:** Wylogowanie użytkownika.
*   **TC-AUTH-006:** Test RLS – użytkownik może edytować/usuwać tylko swoje prompty.
*   **TC-AUTH-007:** Test RLS – użytkownik może przeglądać tylko opublikowane prompty.

### Zarządzanie Promptami (CRUD)

*   **TC-CRUD-001:** Pomyślne utworzenie nowego promptu przez zalogowanego użytkownika.
*   **TC-CRUD-002:** Walidacja danych podczas tworzenia promptu (np. wymagane pola, długość tekstu).
*   **TC-CRUD-003:** Pomyślne odczytanie szczegółów istniejącego promptu.
*   **TC-CRUD-004:** Pomyślna edycja własnego promptu.
*   **TC-CRUD-005:** Próba edycji promptu należącego do innego użytkownika (powinno zakończyć się błędem autoryzacji).
*   **TC-CRUD-006:** Pomyślne usunięcie własnego promptu.
*   **TC-CRUD-007:** Próba usunięcia promptu należącego do innego użytkownika (powinno zakończyć się błędem autoryzacji).

### Wyszukiwanie i Kategoryzacja

*   **TC-SEARCH-001:** Wyszukiwanie promptów po frazie kluczowej (dokładne dopasowanie).
*   **TC-SEARCH-002:** Wyszukiwanie promptów po frazie kluczowej (częściowe dopasowanie).
*   **TC-SEARCH-003:** Wyszukiwanie promptów po tagach.
*   **TC-SEARCH-004:** Wyszukiwanie promptów z użyciem kombinacji frazy i tagów.
*   **TC-SEARCH-005:** Brak wyników dla nieistniejącej frazy/tagu.
*   **TC-SEARCH-006:** Sortowanie wyników wyszukiwania (np. po dacie, popularności).

### System Głosowania

*   **TC-VOTE-001:** Pomyślne oddanie głosu na prompt przez zalogowanego użytkownika.
*   **TC-VOTE-002:** Próba oddania głosu na ten sam prompt wielokrotnie przez tego samego użytkownika (powinno być zablokowane lub zwrócić błąd).
*   **TC-VOTE-003:** Weryfikacja aktualizacji licznika głosów po oddaniu głosu.
*   **TC-VOTE-004:** Próba głosowania na własny prompt (jeśli polityka zezwala/zabrania).

### Kopiowanie do Schowka

*   **TC-COPY-001:** Pomyślne skopiowanie treści promptu do schowka po kliknięciu przycisku.

## 5. Środowisko Testowe

*   **Środowisko Dewelopmentowe:** Lokalne środowiska deweloperskie programistów.
*   **Środowisko Stagingowe:** Środowisko jak najbardziej zbliżone do produkcyjnego, z niezależną instancją Supabase i danych. Będzie używane do testów integracyjnych, E2E, bezpieczeństwa i wydajności.
*   **Przeglądarki:** Najnowsze stabilne wersje Chrome, Firefox, Safari, Edge.
*   **Urządzenia:** Desktop, tablet (iPad/Android), smartfon (iOS/Android) dla testów responsywności.

## 6. Narzędzia do Testowania

*   **Zarządzanie Testami:** JIRA/Confluence (do dokumentowania przypadków testowych i wyników).
*   **Testy Jednostkowe/Integracyjne (JS/TS):** Vitest (runner), React Testing Library (dla React), Supertest (dla API).
*   **Testy E2E:** Cypress / Playwright.
*   **Testy Wizualnej Regresji:** Storybook z wtyczką do VRT / Cypress/Playwright z wbudowanymi funkcjami porównywania zrzutów.
*   **Testy Wydajności:** Artillery / k6 / Lighthouse.
*   **Monitorowanie i Debugowanie:** Narzędzia deweloperskie przeglądarek, logi serwera (Node.js/Supabase).
*   **Kontrola Wersji:** Git.
*   **CI/CD:** GitHub Actions (do automatycznego uruchamiania testów po pushu/pull request).
*   **Linting i Kontrola Typów:** ESLint, TypeScript Compiler (`tsc`).

## 7. Harmonogram Testów

Testowanie będzie integralną częścią cyklu deweloperskiego, z podejściem "test-early, test-often".

*   **Faza 1: Testy Jednostkowe i Integracyjne (w trakcie implementacji):**
    *   Programiści piszą testy jednostkowe i integracyjne równolegle z kodem.
    *   Testy są uruchamiane lokalnie przed commitowaniem zmian.
*   **Faza 2: Testy Integracyjne API i UI (po implementacji kluczowych modułów):**
    *   Automatyczne uruchamianie testów integracyjnych w CI po każdym pushu.
    *   Ręczne testy eksploracyjne i weryfikacja funkcjonalności przez QA.
*   **Faza 3: Testy E2E i Bezpieczeństwa (po ukończeniu MVP):**
    *   Rozwój i uruchamianie zautomatyzowanych testów E2E na środowisku stagingowym.
    *   Przeprowadzenie testów bezpieczeństwa i audytów autoryzacji.
*   **Faza 4: Testy Wydajności i Użyteczności (przed wdrożeniem):**
    *   Testy wydajnościowe na środowisku stagingowym.
    *   Testy użyteczności z użytkownikami docelowymi.
*   **Faza 5: Testy Akceptacyjne (przed wdrożeniem produkcyjnym):**
    *   Weryfikacja wszystkich funkcjonalności przez Product Ownera/klienta.

## 8. Kryteria Akceptacji Testów

Projekt zostanie uznany za gotowy do wdrożenia na produkcję, jeśli spełnione zostaną następujące kryteria:

*   Wszystkie testy jednostkowe przechodzą pomyślnie (100% sukcesu).
*   Wszystkie testy integracyjne przechodzą pomyślnie (minimum 95% sukcesu dla testów API/DB).
*   Wszystkie zdefiniowane testy E2E przechodzą pomyślnie (minimum 90% sukcesu).
*   Brak krytycznych i poważnych defektów.
*   Liczba średnich i niskich defektów jest akceptowalna przez zespół i Product Ownera.
*   Aplikacja spełnia wymagania wydajnościowe (np. czas ładowania strony < 3 sekundy).
*   Brak wykrytych luk bezpieczeństwa o wysokim priorytecie.
*   Aplikacja jest responsywna i działa poprawnie we wszystkich wspieranych przeglądarkach i urządzeniach.
*   Testy użyteczności nie wskazują na poważne problemy z interfejsem użytkownika.

## 9. Role i Odpowiedzialności w Procesie Testowania

*   **Programiści:** Odpowiedzialni za pisanie i utrzymywanie testów jednostkowych i integracyjnych, naprawianie wykrytych defektów, zapewnienie zgodności z typami TypeScript i zasadami ESLint.
*   **Inżynier QA (lub osoba pełniąca tę rolę):** Odpowiedzialny za tworzenie planów testów, projektowanie i wykonywanie testów manualnych, rozwój i utrzymanie testów E2E, wizualnej regresji, wydajności oraz bezpieczeństwa, raportowanie defektów, koordynację testów akceptacyjnych.
*   **Product Owner/Biznes:** Odpowiedzialny za dostarczenie wymagań, udział w testach akceptacyjnych i akceptację produktu końcowego.

## 10. Procedury Raportowania Błędów

*   Wszystkie wykryte defekty będą raportowane w narzędziu do zarządzania projektami (np. JIRA) z następującymi informacjami:
    *   Tytuł defektu.
    *   Krótki opis.
    *   Kroki do reprodukcji.
    *   Oczekiwany rezultat.
    *   Rzeczywisty rezultat.
    *   Środowisko testowe (przeglądarka, system operacyjny, adres URL).
    *   Priorytet (krytyczny, wysoki, średni, niski).
    *   Załączniki (zrzuty ekranu, nagrania wideo, logi).
    *   Przypisanie do odpowiedzialnego dewelopera.
*   Defekty będą priorytetyzowane i naprawiane zgodnie z ustaloną kolejnością.
*   Po naprawie deweloper przypisze defekt z powrotem do QA w celu weryfikacji poprawki.