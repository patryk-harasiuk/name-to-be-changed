# 🚀 Wstęp do Interaktywnych Skryptów
Witaj w trybie prezentacji! Ten dokument udowadnia, że zwykły plik tekstowy może stać się płynnym, kinowym doświadczeniem edukacyjnym.

Naciśnij **Strzałkę w prawo** lub **Spację**, aby przejść do następnego panelu.

## 🛠 Główne założenia projektu
Zamiast tradycyjnych, nudnych slajdów (np. w PowerPoint), korzystamy z nowoczesnych technologii webowych.

Nasze cele to:
* **Separacja treści od wyglądu:** Wykładowca skupia się tylko na pisaniu tekstu.
* **Płynność (Marvel Style):** Aplikacja sama dba o odpowiednie przesuwanie i skalowanie widoku kamery.
* **Uniwersalność:** Skrypt zadziała na każdym urządzeniu.

## 🧮 Wsparcie dla Matematyki (KaTeX)
W przyszłości zintegrujemy bibliotekę, która zamieni zwykły tekst w piękne wzory matematyczne. 

Oto równanie opisujące Transformację Fouriera. Kiedy podepniemy KaTeX, ten blok zamieni się w wektorową grafikę:

$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x) e^{-2\pi i x \xi} dx
$$

## 💻 Technologie pod maską
Aby osiągnąć ten efekt, wykorzystaliśmy genialne narzędzia ze świata frontend'u. 

Oto jak wygląda fragment naszego kodu w React:

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') {
    nextPanel();
  }
};