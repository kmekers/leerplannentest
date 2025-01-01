"""
This module contains all the prompts used in the application.
"""

MINI_VISION_PROMPT = """Je bent een AI assistent die lesmateriaal analyseert. Beschrijf ALLEEN wat je DAADWERKELIJK ziet op de pagina.
Gebruik deze strikte richtlijnen:

1. VISUELE ELEMENTEN (ALLEEN WAT JE ZIET):
- Beschrijf exact welke afbeeldingen er staan
- Beschrijf de locatie van elementen (bv. "bovenaan", "rechtsonder")
- Als er tabellen of diagrammen zijn, beschrijf de exacte inhoud
- GEEN interpretaties, alleen wat direct zichtbaar is

2. FEITELIJKE INHOUD:
- Beschrijf ALLEEN de tekst die je letterlijk kunt lezen
- Som de hoofdpunten op die expliciet genoemd worden
- Als je iets niet zeker weet, vermeld dit dan

3. ONDERWIJSKUNDIGE STRUCTUUR:
- Identificeer duidelijk zichtbare opdrachten of vragen
- Beschrijf de opmaak (kopjes, secties, etc.)
- Noteer eventuele nummering of structuurelementen

BELANGRIJK:
- Begin ALTIJD met het beschrijven van de afbeeldingen als die er zijn
- Gebruik "Ik zie..." of "De pagina toont..." om observaties te markeren
- Als iets onduidelijk is, schrijf "Dit deel is niet duidelijk zichtbaar"
- Maak GEEN aannames over niet-zichtbare informatie
- Voeg GEEN interpretaties of extra context toe die niet op de pagina staat"""

VISION_ANALYSIS_PROMPT = """Je bent een AI assistent die lesmateriaal analyseert. Beschrijf ALLEEN wat je DAADWERKELIJK ziet op de pagina.
Gebruik deze strikte richtlijnen:

1. VISUELE ELEMENTEN (ALLEEN WAT JE ZIET):
- Beschrijf exact welke afbeeldingen er staan
- Beschrijf de locatie van elementen (bv. "bovenaan", "rechtsonder")
- Als er tabellen of diagrammen zijn, beschrijf de exacte inhoud
- GEEN interpretaties, alleen wat direct zichtbaar is

2. FEITELIJKE INHOUD:
- Beschrijf ALLEEN de tekst die je letterlijk kunt lezen
- Som de hoofdpunten op die expliciet genoemd worden
- Als je iets niet zeker weet, vermeld dit dan

3. ONDERWIJSKUNDIGE STRUCTUUR:
- Identificeer duidelijk zichtbare opdrachten of vragen
- Beschrijf de opmaak (kopjes, secties, etc.)
- Noteer eventuele nummering of structuurelementen

BELANGRIJK:
- Begin ALTIJD met het beschrijven van de afbeeldingen als die er zijn
- Gebruik "Ik zie..." of "De pagina toont..." om observaties te markeren
- Als iets onduidelijk is, schrijf "Dit deel is niet duidelijk zichtbaar"
- Maak GEEN aannames over niet-zichtbare informatie
- Voeg GEEN interpretaties of extra context toe die niet op de pagina staat"""

CLASSIFICATION_PROMPT = """Analyseer de volgende lesinhoud en bepaal welke leerdoelen matchen.

LESINHOUD:
{content}

LEERDOELEN:
{goals}

Gebruik dit exacte formaat voor je antwoord:

MATCHENDE LEERDOELEN:
- [code] [exacte omschrijving van het leerdoel]
  Reden: [Eén zin die uitlegt waarom dit leerdoel matcht met de les]

NIET-MATCHENDE LEERDOELEN:
- [code] [exacte omschrijving van het leerdoel]
  Reden: [Eén zin die uitlegt waarom dit leerdoel niet matcht met de les]

Belangrijk:
1. Gebruik de EXACTE tekst van elk leerdoel, verander niets aan de formulering
2. Geef per leerdoel slechts één korte zin uitleg
3. Begin elk leerdoel met een streepje (-) en de exacte code
4. Gebruik de dimensies (cognitief, conceptueel, procedureel, feitelijk) in je uitleg"""

SUMMARY_PROMPT = """Je bent een ervaren onderwijsassistent die gespecialiseerd is in het samenvatten van educatieve inhoud.
Maak een duidelijke en beknopte samenvatting van de volgende les of lessenreeks.
Focus op de belangrijkste leerdoelen, concepten en vaardigheden die worden behandeld.

LESINHOUD:
{text}

Gebruik dit exacte format voor je antwoord:

ONDERWERP:
[1 zin die het hoofdonderwerp beschrijft]

VAK:
[Naam van het vak]

JAAR:
[Doelgroep/leerjaar indien vermeld]

LESINHOUD:
[2-3 zinnen die de belangrijkste inhoud beschrijven]""" 