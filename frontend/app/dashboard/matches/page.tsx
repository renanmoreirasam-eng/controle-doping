'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import { Sidebar } from '../../../components/Sidebar';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type Championship = {
  id: string;
  name: string;
};

type Stadium = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type Team = {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  state: string;
  isActive: boolean;
};

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: string;
  missionCode?: string;
  missionOrderAnalysis?: string | null;
  matchNumber?: string | null;
  roundOrPhase?: string | null;
  missionOrderFileName?: string | null;
  missionOrderFileType?: string | null;
  missionOrderFileData?: string | null;
  athleteListFileName?: string | null;
  athleteListFileType?: string | null;
  athleteListFileData?: string | null;
  finalDocumentFileName?: string | null;
  finalDocumentFileType?: string | null;
  finalDocumentFileData?: string | null;
  championshipId?: string;
  stadiumId?: string;

  championship: {
    id?: string;
    name: string;
  };

  stadium: {
    id?: string;
    name: string;
    city: string;
    state: string;
  };

  officials?: {
    id: string;
    role: string;
    confirmed: boolean | null;
    official?: {
      id?: string;
      name?: string | null;
      user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
      } | null;
    } | null;
  }[];
};

type MissionOrderFile = {
  fileName: string;
  fileType: string;
  dataUrl?: string;
};

type MatchDocumentType = 'mission-order' | 'athlete-list' | 'final-document';

type ModalVariant = 'danger' | 'success' | 'warning' | 'default';

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: ModalVariant;
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
};

const MAX_MISSION_ORDER_SIZE_MB = 8;
const DEFAULT_MISSION_ORDER_ANALYSIS = 'Urine';
const COMPLEMENTARY_MISSION_ORDER_ANALYSIS =
  'Urine + GHRF (GHS/GHRP), ERAs (incl. recombinant ERAs and analogues)';

type MissionOrderInfo = {
  missionCode: string;
  missionOrderAnalysis: string;
};


function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));

    reader.readAsDataURL(file);
  });
}

function canAccessMatchOperation(matchDate: string) {
  const today = new Date();
  const date = new Date(matchDate);

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const matchOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  return todayOnly >= matchOnly;
}

function extractMissionCodeFromText(text: string) {
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  const patterns = [
    /ADAMS\s+Mission\s+Order\s*#\s*:?\s*(?:TO\s*[-–—:]?\s*)?(\d{6,})/i,
    /Mission\s+Order\s*#\s*:?\s*(?:TO\s*[-–—:]?\s*)?(\d{6,})/i,
    /Ordem\s+de\s+Miss[aã]o\s*#?\s*:?\s*(?:TO\s*[-–—:]?\s*)?(\d{6,})/i,
    /C[oó]digo\s+da\s+Miss[aã]o\s*#?\s*:?\s*(?:TO\s*[-–—:]?\s*)?(\d{6,})/i,
    /\bTO\s*[-–—:]?\s*(\d{6,})\b/i,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return '';
}

function extractMissionOrderAnalysisFromText(text: string) {
  const normalizedText = text
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const hasComplementaryAnalysis =
    normalizedText.includes('ghrf') ||
    normalizedText.includes('ghs/ghrp') ||
    normalizedText.includes('recombinant eras') ||
    normalizedText.includes('analogues') ||
    /\beras\b/i.test(normalizedText);

  return hasComplementaryAnalysis
    ? COMPLEMENTARY_MISSION_ORDER_ANALYSIS
    : DEFAULT_MISSION_ORDER_ANALYSIS;
}

function getMissionOrderAnalysisDisplay(value?: string | null) {
  return String(value || '').trim() || DEFAULT_MISSION_ORDER_ANALYSIS;
}

function hasComplementaryMissionOrderAnalysis(value?: string | null) {
  return getMissionOrderAnalysisDisplay(value) !== DEFAULT_MISSION_ORDER_ANALYSIS;
}

async function extractMissionOrderInfoFromPdf(file: File): Promise<MissionOrderInfo> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const arrayBuffer = await file.arrayBuffer();

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
  });

  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];
  let missionCode = '';

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');

    pageTexts.push(pageText);

    if (!missionCode) {
      missionCode = extractMissionCodeFromText(pageText);
    }
  }

  const fullText = pageTexts.join(' ');

  return {
    missionCode: missionCode || extractMissionCodeFromText(fullText),
    missionOrderAnalysis: extractMissionOrderAnalysisFromText(fullText),
  };
}

async function extractMissionOrderInfoFromFile(file: File): Promise<MissionOrderInfo> {
  const isPdf =
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return {
      missionCode: '',
      missionOrderAnalysis: '',
    };
  }

  return extractMissionOrderInfoFromPdf(file);
}


function dataUrlToBlob(dataUrl: string) {
  const [header, base64Data] = dataUrl.split(',');
  const mimeType =
    header?.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';

  const binaryString = window.atob(base64Data || '');
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const blob = dataUrlToBlob(dataUrl);
  const blobUrl = window.URL.createObjectURL(blob);

  if (isIOSDevice()) {
    const openedWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

    if (!openedWindow) {
      window.location.href = blobUrl;
    }

    window.setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);

    return;
  }

  const link = document.createElement('a');

  link.href = blobUrl;
  link.download = fileName;
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);
}

function downloadBlob(blob: Blob, fileName: string) {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = blobUrl;
  link.download = fileName;
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);
}

function escapeExcelHtml(value?: string | number | null) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeExcelText(value?: string | null) {
  return String(value || '').trim() || '-';
}

function getExcelDateValue(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return `${day}/${months[parsedDate.getMonth()]} - ${weekdays[parsedDate.getDay()]}`;
}

function getExcelTimeValue(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function getExcelYearValue(matches: Match[]) {
  const firstValidMatch = matches.find(
    (match) => !Number.isNaN(new Date(match.matchDate).getTime()),
  );

  return firstValidMatch
    ? new Date(firstValidMatch.matchDate).getFullYear()
    : new Date().getFullYear();
}

function getExcelRoundOrPhase(value?: string | null) {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return {
      header: 'RODADA',
      value: '-',
    };
  }

  const faseMatch = normalizedValue.match(/^fase\s+(.+)$/i);

  if (faseMatch?.[1]) {
    return {
      header: 'FASE',
      value: faseMatch[1].trim(),
    };
  }

  const rodadaMatch = normalizedValue.match(/^rodada\s+(.+)$/i);

  if (rodadaMatch?.[1]) {
    return {
      header: 'RODADA',
      value: rodadaMatch[1].trim(),
    };
  }

  const looksLikePhase = /[A-Za-zÀ-ÿ]/.test(normalizedValue);

  return {
    header: looksLikePhase ? 'FASE' : 'RODADA',
    value: normalizedValue,
  };
}

function getExcelCityState(match: Match) {
  const city = String(match.stadium?.city || '').trim();
  const state = String(match.stadium?.state || '').trim();

  if (!city && !state) return '-';
  if (!state) return city;
  if (!city) return state;

  return `${city} ${state}`;
}

function getOfficialNameForExcel(match: Match, role: 'DCO' | 'ASSISTANT') {
  const officialScale = match.officials?.find(
    (scale) => String(scale.role || '').toUpperCase() === role,
  );

  return (
    officialScale?.official?.user?.name ||
    officialScale?.official?.name ||
    ''
  );
}

function getMatchOfficial(match: Match, role: 'DCO' | 'ASSISTANT') {
  return match.officials?.find(
    (scale) => String(scale.role || '').toUpperCase() === role,
  );
}

function getMatchOfficialName(match: Match, role: 'DCO' | 'ASSISTANT') {
  const scale = getMatchOfficial(match, role);

  return (
    scale?.official?.user?.name ||
    scale?.official?.name ||
    'Não escalado'
  );
}

function getFirstName(fullName: string) {
  const normalizedName = String(fullName || '').trim();

  if (!normalizedName || normalizedName === 'Não escalado') {
    return normalizedName || 'Não escalado';
  }

  return normalizedName.split(/\s+/)[0];
}

function getOfficialConfirmationLabel(confirmed: boolean | null | undefined) {
  if (confirmed === true) return 'Confirmado';
  if (confirmed === false) return 'Recusado';
  return 'Pendente';
}

function getOfficialConfirmationClass(confirmed: boolean | null | undefined) {
  if (confirmed === true) {
    return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  }

  if (confirmed === false) {
    return 'border-red-100 bg-red-50 text-red-700';
  }

  return 'border-yellow-100 bg-yellow-50 text-yellow-700';
}

function getExcelGroupKey(match: Match) {
  const roundOrPhase = getExcelRoundOrPhase(match.roundOrPhase);
  const championshipName = normalizeExcelText(match.championship?.name);

  return `${championshipName}__${roundOrPhase.header}__${roundOrPhase.value}`;
}

function getExcelGroupRows(matches: Match[]) {
  const sortedMatches = [...matches].sort((firstMatch, secondMatch) => {
    const championshipSort = normalizeExcelText(firstMatch.championship?.name)
      .localeCompare(normalizeExcelText(secondMatch.championship?.name), 'pt-BR');

    if (championshipSort !== 0) return championshipSort;

    const roundSort = normalizeExcelText(firstMatch.roundOrPhase)
      .localeCompare(normalizeExcelText(secondMatch.roundOrPhase), 'pt-BR', {
        numeric: true,
        sensitivity: 'base',
      });

    if (roundSort !== 0) return roundSort;

    return new Date(firstMatch.matchDate).getTime() - new Date(secondMatch.matchDate).getTime();
  });

  const groups = new Map<
    string,
    {
      championshipName: string;
      roundHeader: string;
      roundValue: string;
      matches: Match[];
    }
  >();

  sortedMatches.forEach((match) => {
    const roundOrPhase = getExcelRoundOrPhase(match.roundOrPhase);
    const key = getExcelGroupKey(match);

    if (!groups.has(key)) {
      groups.set(key, {
        championshipName: normalizeExcelText(match.championship?.name),
        roundHeader: roundOrPhase.header,
        roundValue: roundOrPhase.value,
        matches: [],
      });
    }

    groups.get(key)?.matches.push(match);
  });

  return Array.from(groups.values());
}

function buildMatchesExcelHtml(matches: Match[]) {
  const year = getExcelYearValue(matches);
  const groupRows = getExcelGroupRows(matches);
  const groupColors = [
    '#073763',
    '#b6d7a8',
    '#5b2607',
    '#ff66ff',
    '#f4b183',
    '#00b050',
    '#ffff00',
    '#9fc5e8',
  ];

  const bodyRows = groupRows
    .map((group, groupIndex) => {
      const backgroundColor = groupColors[groupIndex % groupColors.length];
      const textColor = backgroundColor === '#073763' || backgroundColor === '#5b2607'
        ? '#000000'
        : '#000000';
      const previousGroup = groupRows[groupIndex - 1];
      const shouldAddChampionshipSpace =
        groupIndex > 0 && previousGroup?.championshipName !== group.championshipName;
      const championshipSeparator = shouldAddChampionshipSpace
        ? '<tr class="separator-row"><td colspan="12"></td></tr>'
        : '';

      const headerRow = `
        <tr class="header-row">
          <th>CAMPEONATO</th>
          <th>${escapeExcelHtml(group.roundHeader)}</th>
          <th>JG</th>
          <th>DATA</th>
          <th>HORA</th>
          <th>MANDANTE</th>
          <th>X</th>
          <th>VISITANTE</th>
          <th>ESTADO - CIDADE</th>
          <th>ESTADIO</th>
          <th>DCO LÍDER</th>
          <th>CHAPERONE</th>
        </tr>
      `;

      const rowSpan = group.matches.length;

      const matchRows = group.matches
        .map((match, index) => `
          <tr class="match-row" style="background:${backgroundColor}; color:${textColor};">
            ${
              index === 0
                ? `<td class="center bold merged-cell" rowspan="${rowSpan}">${escapeExcelHtml(group.championshipName)}</td>`
                : ''
            }
            ${
              index === 0
                ? `<td class="center bold merged-cell" rowspan="${rowSpan}">${escapeExcelHtml(group.roundValue)}</td>`
                : ''
            }
            <td class="center bold">${escapeExcelHtml(match.matchNumber || '-')}</td>
            <td class="center bold">${escapeExcelHtml(getExcelDateValue(match.matchDate))}</td>
            <td class="center bold">${escapeExcelHtml(getExcelTimeValue(match.matchDate))}</td>
            <td>${escapeExcelHtml(normalizeExcelText(match.homeTeam))}</td>
            <td class="center bold">X</td>
            <td>${escapeExcelHtml(normalizeExcelText(match.awayTeam))}</td>
            <td>${escapeExcelHtml(getExcelCityState(match))}</td>
            <td>${escapeExcelHtml(normalizeExcelText(match.stadium?.name))}</td>
            <td class="center bold">${escapeExcelHtml(normalizeExcelText(getOfficialNameForExcel(match, 'DCO')))}</td>
            <td class="center bold">${escapeExcelHtml(normalizeExcelText(getOfficialNameForExcel(match, 'ASSISTANT')))}</td>
          </tr>
        `)
        .join('');

      return `${championshipSeparator}${headerRow}${matchRows}`;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          table {
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 11pt;
            width: 100%;
          }

          td, th {
            border: 1px solid #000000;
            padding: 3px 6px;
            vertical-align: middle;
            white-space: nowrap;
          }

          .title-row td {
            background: #ffff00;
            border-color: #ffff00;
            height: 26px;
            text-align: center;
            font-weight: 700;
          }

          .header-row th {
            background: #404040;
            color: #000000;
            font-weight: 700;
            text-align: center;
          }

          .separator-row td {
            background: #ffffff;
            border: none;
            height: 16px;
            padding: 0;
          }

          .match-row td {
            font-weight: 600;
          }

          .merged-cell {
            vertical-align: middle;
          }

          .center {
            text-align: center;
          }

          .bold {
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <table>
          <colgroup>
            <col style="width: 150px;" />
            <col style="width: 90px;" />
            <col style="width: 55px;" />
            <col style="width: 110px;" />
            <col style="width: 70px;" />
            <col style="width: 220px;" />
            <col style="width: 35px;" />
            <col style="width: 220px;" />
            <col style="width: 230px;" />
            <col style="width: 260px;" />
            <col style="width: 190px;" />
            <col style="width: 190px;" />
          </colgroup>
          <tr class="title-row">
            <td colspan="12">CBF - ${year}</td>
          </tr>
          ${bodyRows}
        </table>
      </body>
    </html>
  `;
}

function getCleanExcelGeneratedAtValue() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function buildMatchesCleanExcelHtml(matches: Match[]) {
  const year = getExcelYearValue(matches);
  const groupRows = getExcelGroupRows(matches);
  const totalMatches = matches.length;

  const bodyRows = groupRows
    .map((group, groupIndex) => {
      const previousGroup = groupRows[groupIndex - 1];
      const shouldStartChampionship =
        groupIndex === 0 || previousGroup?.championshipName !== group.championshipName;

      const championshipSeparator =
        groupIndex > 0 && shouldStartChampionship
          ? '<tr class="separator-row"><td colspan="9"></td></tr>'
          : '';

      const championshipRow = shouldStartChampionship
        ? `
          <tr class="championship-row">
            <td colspan="9">${escapeExcelHtml(group.championshipName)}</td>
          </tr>
        `
        : '';

      const rowSpan = group.matches.length;
      const roundLabel = `${group.roundHeader}: ${group.roundValue}`;

      const matchRows = group.matches
        .map((match, index) => `
          <tr class="match-row">
            ${
              index === 0
                ? `<td class="center bold round-cell" rowspan="${rowSpan}">${escapeExcelHtml(roundLabel)}</td>`
                : ''
            }
            <td class="center bold">${escapeExcelHtml(match.matchNumber || '-')}</td>
            <td class="center bold">${escapeExcelHtml(getExcelDateValue(match.matchDate))}</td>
            <td class="center bold">${escapeExcelHtml(getExcelTimeValue(match.matchDate))}</td>
            <td class="bold">${escapeExcelHtml(`${normalizeExcelText(match.homeTeam)} x ${normalizeExcelText(match.awayTeam)}`)}</td>
            <td>${escapeExcelHtml(getExcelCityState(match))}</td>
            <td>${escapeExcelHtml(normalizeExcelText(match.stadium?.name))}</td>
            <td>${escapeExcelHtml(normalizeExcelText(getOfficialNameForExcel(match, 'DCO')))}</td>
            <td>${escapeExcelHtml(normalizeExcelText(getOfficialNameForExcel(match, 'ASSISTANT')))}</td>
          </tr>
        `)
        .join('');

      return `${championshipSeparator}${championshipRow}${matchRows}`;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          table {
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 10.5pt;
            width: 100%;
          }

          td, th {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            vertical-align: middle;
            white-space: nowrap;
          }

          .title-row td {
            background: #0f172a;
            color: #ffffff;
            border-color: #0f172a;
            height: 30px;
            text-align: center;
            font-size: 14pt;
            font-weight: 700;
          }

          .subtitle-row td {
            background: #f8fafc;
            color: #475569;
            border-color: #e2e8f0;
            height: 24px;
            text-align: center;
            font-size: 10pt;
            font-weight: 600;
          }

          .header-row th {
            background: #e0f2fe;
            color: #0f172a;
            font-weight: 700;
            text-align: center;
          }

          .championship-row td {
            background: #dbeafe;
            color: #1e3a8a;
            border-color: #93c5fd;
            font-size: 12pt;
            font-weight: 700;
            height: 26px;
          }

          .match-row:nth-child(even) td {
            background: #ffffff;
          }

          .match-row:nth-child(odd) td {
            background: #f8fafc;
          }

          .round-cell {
            background: #eef2ff !important;
            color: #3730a3;
          }

          .separator-row td {
            background: #ffffff;
            border: none;
            height: 14px;
            padding: 0;
          }

          .center {
            text-align: center;
          }

          .bold {
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <table>
          <colgroup>
            <col style="width: 110px;" />
            <col style="width: 55px;" />
            <col style="width: 110px;" />
            <col style="width: 70px;" />
            <col style="width: 300px;" />
            <col style="width: 190px;" />
            <col style="width: 240px;" />
            <col style="width: 180px;" />
            <col style="width: 180px;" />
            </colgroup>
          <tr class="title-row">
            <td colspan="9">Jogos selecionados - ${year}</td>
          </tr>
          <tr class="subtitle-row">
            <td colspan="9">${totalMatches} jogo${totalMatches === 1 ? '' : 's'} selecionado${totalMatches === 1 ? '' : 's'} · Gerado em ${escapeExcelHtml(getCleanExcelGeneratedAtValue())}</td>
          </tr>
          <tr class="header-row">
            <th>RODADA/FASE</th>
            <th>JG</th>
            <th>DATA</th>
            <th>HORA</th>
            <th>JOGO</th>
            <th>LOCAL</th>
            <th>ESTÁDIO</th>
            <th>DCO LÍDER</th>
            <th>CHAPERONE</th>
          </tr>
          ${bodyRows}
        </table>
      </body>
    </html>
  `;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'DONE'>('ACTIVE');
  const [cardFilter, setCardFilter] = useState<
    '' | 'TO_DO' | 'MISSING_DOCUMENTATION' | 'COMPLETED' | 'MISSION_ORDER'
  >('');

  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [search, setSearch] = useState('');
  const [championshipFilter, setChampionshipFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [expandedOfficialKey, setExpandedOfficialKey] = useState<string | null>(null);
  const [expandedTeamKey, setExpandedTeamKey] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [championshipId, setChampionshipId] = useState('');
  const [championshipName, setChampionshipName] = useState('');

  const [stadiumId, setStadiumId] = useState('');
  const [stadiumName, setStadiumName] = useState('');

  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');

  const [status, setStatus] = useState('SCHEDULED');

  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [missionCode, setMissionCode] = useState('');
  const [missionOrderAnalysis, setMissionOrderAnalysis] = useState('');
  const [matchNumber, setMatchNumber] = useState('');
  const [roundOrPhase, setRoundOrPhase] = useState('');
  const [roundOrPhaseType, setRoundOrPhaseType] = useState<'Rodada' | 'Fase'>('Rodada');
  const [roundOrPhaseNumber, setRoundOrPhaseNumber] = useState('');
  const [missionOrderFile, setMissionOrderFile] = useState<MissionOrderFile | null>(null);
  const [existingMissionOrderFile, setExistingMissionOrderFile] = useState<MissionOrderFile | null>(null);
  const [removeMissionOrderFile, setRemoveMissionOrderFile] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: '',
    message: '',
    variant: 'default',
    confirmText: 'Fechar',
  });

  const user = getUser();

  const userRole = String(
    user?.role || user?.user?.role || '',
  ).toUpperCase();

  const isAdmin = userRole === 'ADMIN';
  const canViewMatchFiles = userRole !== 'OFFICIAL';
  const canViewAdminDocumentCards = userRole !== 'OFFICIAL';

  function getMissionCodeDisplay(value?: string | null) {
    if (!value) return '';

    if (userRole === 'OFFICIAL') {
      return '*************';
    }

    return value;
  }

  function canOpenMatchOperation(match: Match) {
    if (userRole === 'OFFICIAL' && match.status === 'CONTROL_DONE') {
      return false;
    }

    return canAccessMatchOperation(match.matchDate);
  }

  const formRef = useRef<HTMLDivElement | null>(null);
  const missionOrderFileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadMatches() {
    const response = await api.get('/matches');
    setMatches(response.data);
  }

  async function loadChampionships() {
    const response = await api.get('/championships');
    setChampionships(response.data);
  }

  async function loadStadiums() {
    const response = await api.get('/stadiums');
    setStadiums(response.data);
  }

  async function loadTeams() {
    const response = await api.get('/teams');

    const activeTeams = response.data.filter(
      (team: Team) => team.isActive,
    );

    setTeams(activeTeams);
  }

  useEffect(() => {
    loadMatches();
    loadChampionships();
    loadStadiums();
    loadTeams();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusFilter = params.get('status');
    const filter = params.get('filter');

    if (statusFilter === 'CONTROL_DONE') {
      setActiveTab('DONE');
      setCardFilter('COMPLETED');
      return;
    }

    if (filter === 'MISSION_ORDER') {
      setActiveTab('ACTIVE');
      setCardFilter('MISSION_ORDER');
    }
  }, []);

  function hasMissionOrder(match: Match) {
    return Boolean(
      match.missionOrderFileData ||
        match.missionOrderFileName ||
        match.missionOrderFileType,
    );
  }

  function hasAthleteList(match: Match) {
    return Boolean(
      match.athleteListFileData ||
        match.athleteListFileName ||
        match.athleteListFileType,
    );
  }

  function hasFinalDocumentation(match: Match) {
    return Boolean(
      match.finalDocumentFileData ||
        match.finalDocumentFileName ||
        match.finalDocumentFileType,
    );
  }

  function hasAnyMatchDocument(match: Match) {
    return hasMissionOrder(match) || hasAthleteList(match) || hasFinalDocumentation(match);
  }

  function isMatchToDo(match: Match) {
    return match.status !== 'CONTROL_DONE' && match.status !== 'CANCELED';
  }

  function isCompletedWithoutDocumentation(match: Match) {
    return match.status === 'CONTROL_DONE' && !hasFinalDocumentation(match);
  }

  function isPendingMissionOrder(match: Match) {
    return isMatchToDo(match) && !hasMissionOrder(match);
  }

  function applyCardFilter(filter: typeof cardFilter, tab: typeof activeTab) {
    setCardFilter(filter);
    setActiveTab(tab);
  }

  function getTodayDateFilterValue() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function applyTodayDateFilter() {
    const today = getTodayDateFilterValue();

    setStartDateFilter(today);
    setEndDateFilter(today);
  }

  function clearListFilters() {
    setSearch('');
    setChampionshipFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  }

  const todayDateFilterValue = getTodayDateFilterValue();
  const isTodayDateFilterActive =
    startDateFilter === todayDateFilterValue &&
    endDateFilter === todayDateFilterValue;
  const hasListFilters = Boolean(
    search || championshipFilter || startDateFilter || endDateFilter,
  );

  const filteredMatches = useMemo(() => {
    return matches
      .filter((match) => {
        const value = `
          ${match.missionCode || ''}
          ${match.missionOrderAnalysis || ''}
          ${match.matchNumber || ''}
          ${match.roundOrPhase || ''}
          ${match.homeTeam}
          ${match.awayTeam}
          ${match.championship.name}
          ${match.stadium.name}
          ${match.stadium.city}
        `.toLowerCase();

        const matchesSearch = value.includes(search.toLowerCase());
        const matchesChampionshipFilter =
          !championshipFilter ||
          match.championshipId === championshipFilter ||
          match.championship?.id === championshipFilter;

        const matchDateValue = formatDateOnly(match.matchDate);
        const matchesStartDateFilter =
          !startDateFilter ||
          Boolean(matchDateValue && matchDateValue >= startDateFilter);
        const matchesEndDateFilter =
          !endDateFilter ||
          Boolean(matchDateValue && matchDateValue <= endDateFilter);

        const matchesTab =
          activeTab === 'DONE'
            ? match.status === 'CONTROL_DONE'
            : match.status !== 'CONTROL_DONE';

        const matchesCardFilter =
          !cardFilter ||
          (cardFilter === 'TO_DO' && isMatchToDo(match)) ||
          (cardFilter === 'MISSING_DOCUMENTATION' &&
            isCompletedWithoutDocumentation(match)) ||
          (cardFilter === 'COMPLETED' && match.status === 'CONTROL_DONE') ||
          (cardFilter === 'MISSION_ORDER' && isPendingMissionOrder(match));

        return (
          matchesSearch &&
          matchesChampionshipFilter &&
          matchesStartDateFilter &&
          matchesEndDateFilter &&
          matchesTab &&
          matchesCardFilter
        );
      })
      .sort(
        (a, b) =>
          new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
      );
  }, [
    matches,
    search,
    championshipFilter,
    startDateFilter,
    endDateFilter,
    activeTab,
    cardFilter,
  ]);

  const matchesToDo = matches.filter(isMatchToDo).length;

  const completedWithoutDocumentation = matches.filter(
    isCompletedWithoutDocumentation,
  ).length;

  const completedMatches = matches.filter(
    (match) => match.status === 'CONTROL_DONE',
  ).length;

  const pendingMissionOrder = matches.filter(isPendingMissionOrder).length;

  const activeMatches = matches.filter(
    (match) => match.status !== 'CONTROL_DONE',
  ).length;

  const doneMatches = matches.filter(
    (match) => match.status === 'CONTROL_DONE',
  ).length;

  const championshipFilterOptions = championships
    .filter((championship) =>
      matches.some(
        (match) =>
          match.championshipId === championship.id ||
          match.championship?.id === championship.id,
      ),
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const selectedChampionshipFilter = championshipFilterOptions.find(
    (championship) => championship.id === championshipFilter,
  );

  const groupedFilteredMatchesByChampionship = useMemo(() => {
    const groups = new Map<
      string,
      { id: string; name: string; matches: Match[] }
    >();

    filteredMatches.forEach((match) => {
      const championshipIdValue = match.championship?.id || match.championshipId || 'sem-campeonato';
      const championshipName = match.championship?.name || 'Sem campeonato';

      const currentGroup = groups.get(championshipIdValue) || {
        id: championshipIdValue,
        name: championshipName,
        matches: [],
      };

      currentGroup.matches.push(match);
      groups.set(championshipIdValue, currentGroup);
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    );
  }, [filteredMatches]);


  const selectedMatches = useMemo(() => {
    const selectedIds = new Set(selectedMatchIds);

    return matches.filter((match) => selectedIds.has(match.id));
  }, [matches, selectedMatchIds]);

  const filteredMatchIds = useMemo(
    () => filteredMatches.map((match) => match.id),
    [filteredMatches],
  );

  const hasSelectedAllFilteredMatches =
    filteredMatches.length > 0 &&
    filteredMatchIds.every((matchId) => selectedMatchIds.includes(matchId));

  useEffect(() => {
    setSelectedMatchIds((currentSelectedIds) => {
      const existingMatchIds = new Set(matches.map((match) => match.id));

      return currentSelectedIds.filter((matchId) => existingMatchIds.has(matchId));
    });
  }, [matches]);

  function isMatchSelected(matchId: string) {
    return selectedMatchIds.includes(matchId);
  }

  function toggleMatchSelection(matchId: string) {
    setSelectedMatchIds((currentSelectedIds) =>
      currentSelectedIds.includes(matchId)
        ? currentSelectedIds.filter((selectedId) => selectedId !== matchId)
        : [...currentSelectedIds, matchId],
    );
  }

  function toggleFilteredMatchesSelection() {
    if (filteredMatches.length === 0) return;

    setSelectedMatchIds((currentSelectedIds) => {
      const filteredIds = new Set(filteredMatchIds);

      if (filteredMatchIds.every((matchId) => currentSelectedIds.includes(matchId))) {
        return currentSelectedIds.filter((matchId) => !filteredIds.has(matchId));
      }

      return Array.from(new Set([...currentSelectedIds, ...filteredMatchIds]));
    });
  }

  function clearSelectedMatches() {
    setSelectedMatchIds([]);
  }

  function exportSelectedMatchesToCleanExcel() {
    if (selectedMatches.length === 0) {
      showMessage(
        'Nenhum jogo selecionado',
        'Selecione pelo menos um jogo para gerar o arquivo Excel.',
        'warning',
      );

      return;
    }

    const html = buildMatchesCleanExcelHtml(selectedMatches);
    const fileNameDate = new Date().toISOString().slice(0, 10);
    const blob = new Blob(['\ufeff', html], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });

    downloadBlob(blob, `jogos-cbf-${fileNameDate}.xls`);
  }

  function clearMissionOrderFileSelection() {
    setMissionOrderFile(null);

    if (missionOrderFileInputRef.current) {
      missionOrderFileInputRef.current.value = '';
    }
  }

  function clearMissionOrderFile() {
    setMissionOrderFile(null);
    setExistingMissionOrderFile(null);
    setMissionOrderAnalysis('');
    setRemoveMissionOrderFile(false);

    if (missionOrderFileInputRef.current) {
      missionOrderFileInputRef.current.value = '';
    }
  }


  function closeModal() {
    setModal((current) => ({
      ...current,
      open: false,
      onConfirm: undefined,
      cancelText: undefined,
    }));
  }

  function showMessage(
    title: string,
    message: string,
    variant: ModalVariant = 'default',
  ) {
    setModal({
      open: true,
      title,
      message,
      variant,
      confirmText: 'Fechar',
    });
  }

  function showConfirm({
    title,
    message,
    variant = 'warning',
    confirmText = 'Confirmar',
    onConfirm,
  }: {
    title: string;
    message: string;
    variant?: ModalVariant;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }) {
    setModal({
      open: true,
      title,
      message,
      variant,
      confirmText,
      cancelText: 'Cancelar',
      onConfirm,
    });
  }

  function clearForm() {
    setEditingId(null);
    setChampionshipId('');
    setChampionshipName('');
    setStadiumId('');
    setStadiumName('');
    setHomeTeam('');
    setAwayTeam('');
    setMatchDate('');
    setMatchTime('');
    setMissionCode('');
    setMatchNumber('');
    setRoundOrPhase('');
    setRoundOrPhaseType('Rodada');
    setRoundOrPhaseNumber('');
    clearMissionOrderFile();
    setStatus('SCHEDULED');
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDateOnly(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function formatTimeOnly(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  function buildMatchDatePayload(date: string, time: string) {
    const parsedDate = new Date(`${date}T${time}:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toISOString();
  }

  function parseRoundOrPhase(value?: string | null): {
    type: 'Rodada' | 'Fase';
    number: string;
  } {
    const normalized = String(value || '').trim();
    const match = normalized.match(/^(Rodada|Fase)\s*(.+)$/i);

    if (!match) {
      return { type: 'Rodada', number: normalized };
    }

    const type: 'Rodada' | 'Fase' =
      match[1].toLowerCase() === 'fase' ? 'Fase' : 'Rodada';

    return {
      type,
      number: match[2].trim(),
    };
  }

  function updateRoundOrPhase(type: 'Rodada' | 'Fase', number: string) {
    setRoundOrPhaseType(type);
    setRoundOrPhaseNumber(number);
    setRoundOrPhase(number.trim() ? `${type} ${number.trim()}` : '');
  }

  function buildRoundOrPhase() {
    const number = roundOrPhaseNumber.trim();

    if (!number) return '';

    return `${roundOrPhaseType} ${number}`;
  }

  function teamLabel(team: Team) {
    return `${team.name} — ${team.city}/${team.state}`;
  }

  function normalizeTeamName(value: string) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  function findTeamByName(teamName: string) {
    const normalizedTeamName = normalizeTeamName(teamName);

    return teams.find(
      (team) => normalizeTeamName(team.name) === normalizedTeamName,
    );
  }

  function getTeamShortName(teamName: string) {
    const team = findTeamByName(teamName);
    const registeredShortName = String(team?.shortName || '').trim();

    if (registeredShortName) {
      return registeredShortName.toUpperCase();
    }

    const fallback = String(teamName || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 3)
      .toUpperCase();

    return fallback || '---';
  }

  function renderTeamShortName(
    teamName: string,
    teamKey: string,
    size: 'desktop' | 'mobile' = 'desktop',
  ) {
    const shortName = getTeamShortName(teamName);
    const isExpanded = expandedTeamKey === teamKey;

    return (
      <button
        type="button"
        onClick={() => {
          setExpandedTeamKey((current) =>
            current === teamKey ? null : teamKey,
          );
        }}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Mostrar nome curto de' : 'Mostrar nome completo de'} ${teamName}`}
        title={isExpanded ? 'Voltar para o nome curto' : `Mostrar ${teamName}`}
        className={`inline-flex max-w-full items-center rounded-lg border border-blue-100 bg-blue-50 font-black text-[var(--cdb-blue)] underline decoration-dotted underline-offset-4 transition hover:border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
          size === 'mobile'
            ? 'px-3 py-1.5 text-xl'
            : 'px-2 py-1 text-base'
        } ${isExpanded ? 'whitespace-normal text-left leading-snug' : 'whitespace-nowrap'}`}
      >
        {isExpanded ? teamName : shortName}
      </button>
    );
  }

  function stadiumLabel(stadium: Stadium) {
    return `${stadium.name} — ${stadium.city}/${stadium.state}`;
  }

  function teamExists(teamName: string) {
    return teams.some(
      (team) =>
        team.name.trim().toLowerCase() ===
        teamName.trim().toLowerCase(),
    );
  }

  function findChampionshipByName(name: string) {
    return championships.find(
      (championship) =>
        championship.name.trim().toLowerCase() ===
        name.trim().toLowerCase(),
    );
  }

  function findStadiumByLabel(label: string) {
    return stadiums.find(
      (stadium) =>
        stadiumLabel(stadium).trim().toLowerCase() ===
        label.trim().toLowerCase(),
    );
  }

  function findStadiumByMatch(match: Match) {
    return stadiums.find((stadium) => {
      if (match.stadiumId && stadium.id === match.stadiumId) {
        return true;
      }

      return (
        stadium.name === match.stadium.name &&
        stadium.city === match.stadium.city &&
        stadium.state === match.stadium.state
      );
    });
  }

  async function handleMissionOrderFileChange(file: File | null) {
    if (!file) {
      clearMissionOrderFileSelection();
      setRemoveMissionOrderFile(false);
      return;
    }

    const fileSizeMb = file.size / 1024 / 1024;

    if (fileSizeMb > MAX_MISSION_ORDER_SIZE_MB) {
      showMessage('Arquivo muito grande', `O arquivo deve ter no máximo ${MAX_MISSION_ORDER_SIZE_MB}MB.`, 'warning');
      clearMissionOrderFileSelection();
      setRemoveMissionOrderFile(false);
      return;
    }

    const dataUrl = await fileToDataUrl(file);

    setMissionOrderFile({
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      dataUrl,
    });
    setRemoveMissionOrderFile(false);

    try {
      const extractedInfo = await extractMissionOrderInfoFromFile(file);
      const extractedMissionCode = extractedInfo.missionCode;
      const extractedAnalysis = extractedInfo.missionOrderAnalysis;

      setMissionOrderAnalysis(extractedAnalysis || '');

      if (extractedMissionCode && !missionCode.trim()) {
        setMissionCode(extractedMissionCode);
        showMessage(
          'Ordem de missão identificada',
          `O código da missão ${extractedMissionCode} foi preenchido automaticamente. Análises complementares: ${getMissionOrderAnalysisDisplay(extractedAnalysis)}.`,
          'success',
        );
        return;
      }

      if (extractedAnalysis) {
        showMessage(
          'Análises identificadas',
          `Análises complementares: ${getMissionOrderAnalysisDisplay(extractedAnalysis)}.`,
          'success',
        );
      }
    } catch (error) {
      console.error('Erro ao identificar a ordem de missão:', error);
    }
  }

  function startEdit(match: Match) {
    setEditingId(match.id);

    const currentChampionship = championships.find(
      (championship) =>
        championship.id === match.championshipId ||
        championship.id === match.championship.id ||
        championship.name === match.championship.name,
    );

    setChampionshipId(
      match.championshipId ||
        match.championship.id ||
        currentChampionship?.id ||
        '',
    );

    setChampionshipName(
      currentChampionship?.name ||
        match.championship.name ||
        '',
    );

    const currentStadium = findStadiumByMatch(match);

    setStadiumId(
      match.stadiumId ||
        match.stadium.id ||
        currentStadium?.id ||
        '',
    );

    setStadiumName(
      currentStadium
        ? stadiumLabel(currentStadium)
        : `${match.stadium.name} — ${match.stadium.city}/${match.stadium.state}`,
    );

    setHomeTeam(match.homeTeam);
    setAwayTeam(match.awayTeam);

    setMissionCode(match.missionCode || '');
    setMissionOrderAnalysis(match.missionOrderAnalysis || '');
    setMatchNumber(match.matchNumber || '');

    const parsedRoundOrPhase = parseRoundOrPhase(match.roundOrPhase);
    setRoundOrPhase(match.roundOrPhase || '');
    setRoundOrPhaseType(parsedRoundOrPhase.type);
    setRoundOrPhaseNumber(parsedRoundOrPhase.number);

    clearMissionOrderFile();

    if (
      match.missionOrderFileName ||
      match.missionOrderFileType ||
      match.missionOrderFileData
    ) {
      setExistingMissionOrderFile({
        fileName: match.missionOrderFileName || 'ordem-de-missao',
        fileType: match.missionOrderFileType || 'application/octet-stream',
        dataUrl: match.missionOrderFileData || undefined,
      });
    }

    setMatchDate(formatDateOnly(match.matchDate));
    setMatchTime(formatTimeOnly(match.matchDate));

    setStatus(match.status);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }

  function buildMissionOrderPayload() {
    if (missionOrderFile) {
      return {
        missionOrderFileName: missionOrderFile.fileName,
        missionOrderFileType: missionOrderFile.fileType,
        missionOrderFileData: missionOrderFile.dataUrl,
        missionOrderAnalysis: getMissionOrderAnalysisDisplay(missionOrderAnalysis),
      };
    }

    if (removeMissionOrderFile) {
      return {
        missionOrderFileName: null,
        missionOrderFileType: null,
        missionOrderFileData: null,
        missionOrderAnalysis: null,
      };
    }

    if (editingId && existingMissionOrderFile?.dataUrl) {
      return {
        missionOrderFileName: existingMissionOrderFile.fileName,
        missionOrderFileType: existingMissionOrderFile.fileType,
        missionOrderFileData: existingMissionOrderFile.dataUrl,
        missionOrderAnalysis: missionOrderAnalysis || undefined,
      };
    }

    return {};
  }

  async function createMatchWithIds(
    selectedChampionshipId: string,
    selectedStadiumId: string,
  ) {
    if (!matchDate || !matchTime) {
      showMessage('Campos obrigatórios', 'Informe a data e o horário do jogo.', 'warning');
      return;
    }

    try {
      const fullMatchDate = buildMatchDatePayload(matchDate, matchTime);

      await api.post('/matches', {
        championshipId: selectedChampionshipId,
        stadiumId: selectedStadiumId,
        homeTeam,
        awayTeam,
        missionCode,
        matchNumber,
        roundOrPhase: buildRoundOrPhase(),
        ...buildMissionOrderPayload(),
        matchDate: fullMatchDate,
      });

      clearForm();
      await loadMatches();

      showMessage('Jogo cadastrado', 'Jogo cadastrado com sucesso!', 'success');
    } catch (error: any) {
      showMessage('Erro ao cadastrar jogo', error.response?.data?.message || 'Erro ao cadastrar jogo.', 'danger');
    }
  }

  async function updateMatchWithIds(
    selectedChampionshipId: string,
    selectedStadiumId: string,
  ) {
    if (!editingId) return;

    if (!matchDate || !matchTime) {
      showMessage('Campos obrigatórios', 'Informe a data e o horário do jogo.', 'warning');
      return;
    }

    try {
      const fullMatchDate = buildMatchDatePayload(matchDate, matchTime);

      await api.patch(`/matches/${editingId}`, {
        championshipId: selectedChampionshipId,
        stadiumId: selectedStadiumId,
        homeTeam,
        awayTeam,
        missionCode,
        matchNumber,
        roundOrPhase: buildRoundOrPhase(),
        ...buildMissionOrderPayload(),
        matchDate: fullMatchDate,
        status,
      });

      clearForm();
      await loadMatches();

      showMessage('Jogo atualizado', 'Jogo atualizado com sucesso!', 'success');
    } catch (error: any) {
      showMessage('Erro ao atualizar jogo', error.response?.data?.message || 'Erro ao atualizar jogo.', 'danger');
    }
  }

  function deleteMatch(id: string) {
    showConfirm({
      title: 'Excluir jogo',
      message: 'Deseja realmente excluir este jogo? Essa ação não poderá ser desfeita.',
      variant: 'danger',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/matches/${id}`);
          await loadMatches();

          setModal({
            open: true,
            title: 'Jogo excluído',
            message: 'Jogo excluído com sucesso!',
            variant: 'success',
            confirmText: 'Fechar',
          });
        } catch (error: any) {
          setModal({
            open: true,
            title: 'Erro ao excluir jogo',
            message:
              error.response?.data?.message ||
              'Erro ao excluir jogo.',
            variant: 'danger',
            confirmText: 'Fechar',
          });
        }
      },
    });
  }

  async function downloadMatchDocument(
    match: Match,
    type: MatchDocumentType,
  ) {
    try {
      const response = await api.get(`/matches/${match.id}/documents/${type}`);
      const document = response.data;

      if (!document?.fileData) {
        showMessage(
          'Documento não encontrado',
          'Não foi possível localizar o arquivo solicitado.',
          'warning',
        );
        return;
      }

      downloadDataUrl(
        document.fileData,
        document.fileName || 'documento-do-jogo',
      );
    } catch (error: any) {
      showMessage(
        'Erro ao baixar documento',
        error.response?.data?.message || 'Não foi possível baixar o documento solicitado.',
        'danger',
      );
    }
  }

  function confirmDownloadMatchDocument(
    match: Match,
    type: MatchDocumentType,
    label: string,
  ) {
    showConfirm({
      title: 'Baixar documento',
      message: `Deseja baixar ${label} de ${match.homeTeam} x ${match.awayTeam}?`,
      variant: 'default',
      confirmText: 'Baixar',
      onConfirm: async () => {
        closeModal();
        await downloadMatchDocument(match, type);
      },
    });
  }

  async function handleSubmit() {
    if (
      !championshipName.trim() ||
      !stadiumName.trim() ||
      !homeTeam.trim() ||
      !awayTeam.trim() ||
      !matchNumber.trim() ||
      !roundOrPhaseNumber.trim() ||
      !matchDate ||
      !matchTime
    ) {
      showMessage('Campos obrigatórios', 'Preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    const selectedChampionship =
      findChampionshipByName(championshipName);

    if (!selectedChampionship) {
      showMessage('Campeonato inválido', 'Selecione um campeonato válido da lista.', 'warning');
      return;
    }

    const selectedStadium = findStadiumByLabel(stadiumName);

    if (!selectedStadium) {
      showMessage('Estádio inválido', 'Selecione um estádio válido da lista.', 'warning');
      return;
    }

    if (!teamExists(homeTeam)) {
      showMessage('Time mandante inválido', 'Selecione um time mandante válido da lista.', 'warning');
      return;
    }

    if (!teamExists(awayTeam)) {
      showMessage('Time visitante inválido', 'Selecione um time visitante válido da lista.', 'warning');
      return;
    }

    if (
      homeTeam.trim().toLowerCase() ===
      awayTeam.trim().toLowerCase()
    ) {
      showMessage('Times inválidos', 'Mandante e visitante não podem ser o mesmo time.', 'warning');
      return;
    }

    setChampionshipId(selectedChampionship.id);
    setStadiumId(selectedStadium.id);

    if (editingId) {
      await updateMatchWithIds(
        selectedChampionship.id,
        selectedStadium.id,
      );
      return;
    }

    await createMatchWithIds(
      selectedChampionship.id,
      selectedStadium.id,
    );
  }

  function getStatusLabel(match: Match) {
    if (match.status === 'IN_PROGRESS') {
      return 'Em andamento';
    }

    if (match.status === 'CONTROL_DONE') {
      return 'Controle realizado';
    }

    if (match.status === 'CANCELED') {
      return 'Cancelado';
    }

    const confirmedCount =
      match.officials?.filter(
        (official) => official.confirmed === true,
      ).length || 0;

    if (confirmedCount === 1) {
      return 'Escala aceita 1 DCO';
    }

    if (confirmedCount >= 2) {
      return 'Escala aceita 2 DCO';
    }

    return 'Agendado';
  }

  function getStatusClass(match: Match) {
    if (match.status === 'IN_PROGRESS') {
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    }

    if (match.status === 'CONTROL_DONE') {
      return 'bg-emerald-50 text-[var(--cdb-green)] border border-emerald-100';
    }

    if (match.status === 'CANCELED') {
      return 'bg-red-50 text-red-700 border border-red-100';
    }

    const confirmedCount =
      match.officials?.filter(
        (official) => official.confirmed === true,
      ).length || 0;

    if (confirmedCount === 1) {
      return 'bg-blue-50 text-[var(--cdb-blue)] border border-slate-200';
    }

    if (confirmedCount >= 2) {
      return 'bg-emerald-50 text-[var(--cdb-green)] border border-emerald-100';
    }

    return 'bg-slate-100 text-slate-700 border border-slate-200';
  }


  function renderDesktopMatchesTable(tableMatches: Match[]) {
    return (
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-100">
          <tr className="text-left text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            {isAdmin && (
              <th className="w-[58px] border-b border-slate-200 px-3 py-3 text-center">
                Sel.
              </th>
            )}

            <th className="border-b border-slate-200 px-4 py-3">
              Jogo
            </th>

            <th className="w-[18%] border-b border-slate-200 px-4 py-3">
              Local
            </th>

            <th className="w-[12%] border-b border-slate-200 px-4 py-3">
              Data/Hora
            </th>

            <th className="w-[20%] border-b border-slate-200 px-4 py-3">
              Status / Escala
            </th>

            <th className="w-[15%] border-b border-slate-200 px-4 py-3">
              Documentos
            </th>

            <th className="w-[150px] border-b border-slate-200 px-4 py-3 text-right">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {tableMatches.map((match, index) => (
            <tr
              key={match.id}
              className={`group transition hover:bg-blue-50/60 ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
              }`}
            >
              {isAdmin && (
                <td className="border-b border-slate-200 px-3 py-3 align-top text-center">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white p-2 transition hover:border-[var(--cdb-blue)] hover:bg-blue-50">
                    <input
                      type="checkbox"
                      checked={isMatchSelected(match.id)}
                      onChange={() => toggleMatchSelection(match.id)}
                      aria-label={`Selecionar ${match.homeTeam} x ${match.awayTeam}`}
                      className="h-4 w-4 rounded border-slate-300 text-[var(--cdb-blue)] focus:ring-[var(--cdb-blue)]"
                    />
                  </label>
                </td>
              )}

              <td className="border-b border-slate-200 px-4 py-3 align-top">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-base font-black leading-tight text-[var(--cdb-dark)]">
                    {renderTeamShortName(
                      match.homeTeam,
                      `${match.id}-desktop-home`,
                    )}
                    <span aria-hidden="true">x</span>
                    {renderTeamShortName(
                      match.awayTeam,
                      `${match.id}-desktop-away`,
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
                      Jogo {match.matchNumber || '-'}
                    </span>

                    <span className="inline-flex rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
                      {match.roundOrPhase || 'Sem rodada/fase'}
                    </span>

                    {match.missionCode ? (
                      <span className="inline-flex rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-black text-[var(--cdb-blue)]">
                        🎯 {getMissionCodeDisplay(match.missionCode)}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-400">
                        Sem missão
                      </span>
                    )}
                  </div>

                  {hasMissionOrder(match) && (
                    <span
                      className={`mt-2 inline-flex max-w-full items-center rounded-lg border px-2 py-1 text-[11px] font-black ${
                        hasComplementaryMissionOrderAnalysis(match.missionOrderAnalysis)
                          ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                          : 'border-green-100 bg-green-50 text-green-800'
                      }`}
                    >
                      🧪 {getMissionOrderAnalysisDisplay(match.missionOrderAnalysis)}
                    </span>
                  )}
                </div>
              </td>

              <td className="border-b border-slate-200 px-4 py-3 align-top">
                <div>
                  <p className="font-black text-slate-800">
                    🏟️ {match.stadium.name}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {match.stadium.city}/{match.stadium.state}
                  </p>
                </div>
              </td>

              <td className="whitespace-nowrap border-b border-slate-200 px-4 py-3 align-top">
                <p className="font-black text-slate-900">
                  {formatDate(match.matchDate)}
                </p>

                <p className="mt-1 text-xs font-black text-[var(--cdb-blue)]">
                  ⏰ {formatTime(match.matchDate)}
                </p>
              </td>

              <td className="whitespace-nowrap border-b border-slate-200 px-4 py-3 align-top">
                <div className="flex min-w-0 flex-col gap-1.5 text-xs">
                  <span
                    className={`${getStatusClass(
                      match,
                    )} inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-black`}
                  >
                    {getStatusLabel(match)}
                  </span>

                  <div className="flex min-w-0 flex-col gap-1">
                    {(['DCO', 'ASSISTANT'] as const).map((role) => {
                      const scale = getMatchOfficial(match, role);
                      const label = role === 'DCO' ? 'DCO' : 'OF';
                      const fullName = getMatchOfficialName(match, role);
                      const officialKey = `${match.id}-${role}`;
                      const isExpanded = expandedOfficialKey === officialKey;
                      const canExpand =
                        fullName !== 'Não escalado' && getFirstName(fullName) !== fullName;

                      return (
                        <div key={officialKey} className="flex min-w-0 items-center gap-1.5">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${
                              role === 'DCO'
                                ? 'bg-blue-50 text-[var(--cdb-blue)]'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {label}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              if (!canExpand) return;
                              setExpandedOfficialKey((current) =>
                                current === officialKey ? null : officialKey,
                              );
                            }}
                            aria-expanded={isExpanded}
                            title={
                              scale
                                ? `${fullName} · ${getOfficialConfirmationLabel(scale.confirmed)}`
                                : fullName
                            }
                            className={`max-w-[92px] truncate text-left font-black text-slate-800 ${
                              canExpand
                                ? 'cursor-pointer underline decoration-dotted underline-offset-2 hover:text-[var(--cdb-blue)] focus:outline-none focus:ring-2 focus:ring-blue-100'
                                : 'cursor-default'
                            }`}
                          >
                            {isExpanded ? fullName : getFirstName(fullName)}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </td>

              <td className="border-b border-slate-200 px-4 py-3 align-top">
                {canViewMatchFiles && hasAnyMatchDocument(match) ? (
                  <div className="flex flex-wrap gap-1.5">
                    {hasMissionOrder(match) && (
                      <button
                        type="button"
                        onClick={() =>
                          confirmDownloadMatchDocument(
                            match,
                            'mission-order',
                            'a ordem de missão',
                          )
                        }
                        className="rounded-lg border border-purple-100 bg-purple-50 px-2 py-1.5 text-[11px] font-black text-purple-700 transition hover:bg-purple-100"
                      >
                        O. Missão
                      </button>
                    )}

                    {hasAthleteList(match) && (
                      <button
                        type="button"
                        onClick={() =>
                          confirmDownloadMatchDocument(
                            match,
                            'athlete-list',
                            'a relação de atletas',
                          )
                        }
                        className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1.5 text-[11px] font-black text-[var(--cdb-blue)] transition hover:bg-blue-100"
                      >
                        Relação A.
                      </button>
                    )}

                    {hasFinalDocumentation(match) && (
                      <button
                        type="button"
                        onClick={() =>
                          confirmDownloadMatchDocument(
                            match,
                            'final-document',
                            'a documentação do jogo',
                          )
                        }
                        className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1.5 text-[11px] font-black text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Doc Final
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-400">
                    Sem documentos
                  </span>
                )}
              </td>


              <td className="border-b border-slate-200 px-4 py-3 align-top">
                <div className="flex flex-col items-stretch gap-2">
                  {canOpenMatchOperation(match) ? (
                    <Link
                      href={`/dashboard/matches/${match.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      🧪 Operação
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title={
                        userRole === 'OFFICIAL' && match.status === 'CONTROL_DONE'
                          ? 'Operação finalizada. Oficiais não têm acesso após a conclusão.'
                          : 'A operação será liberada a partir do dia do jogo.'
                      }
                      className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-400"
                    >
                      🧪 Operação
                    </button>
                  )}

                  {isAdmin && match.status !== 'CONTROL_DONE' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(match)}
                        className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-2 py-1.5 text-xs font-black text-[var(--cdb-blue)] transition hover:bg-blue-100"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteMatch(match.id)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-2 py-1.5 text-xs font-black text-red-700 transition hover:bg-red-100"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                ⚽ Gestão operacional
              </div>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Jogos
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Cadastre, acompanhe e opere as partidas do controle de doping.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {matches.length} jogos cadastrados
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-8">
            <button
              type="button"
              onClick={() => applyCardFilter('TO_DO', 'ACTIVE')}
              className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md text-left ${
                cardFilter === 'TO_DO'
                  ? 'bg-[var(--cdb-blue-soft)] border-blue-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      cardFilter === 'TO_DO'
                        ? 'text-[var(--cdb-blue)]'
                        : 'text-slate-500'
                    }`}
                  >
                    Jogos para realizar
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-blue)]">
                    {matchesToDo}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    {isAdmin ? 'Todos ainda não concluídos' : 'Meus jogos ativos'}
                  </p>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-3xl">
                  📅
                </div>
              </div>
            </button>

            {canViewAdminDocumentCards && (
            <button
              type="button"
              onClick={() => applyCardFilter('MISSING_DOCUMENTATION', 'DONE')}
              className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md text-left ${
                completedWithoutDocumentation > 0
                  ? 'bg-[var(--cdb-yellow-soft)] border-yellow-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      completedWithoutDocumentation > 0
                        ? 'text-[#9A7600]'
                        : 'text-slate-500'
                    }`}
                  >
                    Finalizados sem documentação
                  </p>

                  <h2
                    className={`text-3xl lg:text-4xl font-black mt-2 ${
                      completedWithoutDocumentation > 0
                        ? 'text-[#9A7600]'
                        : 'text-slate-700'
                    }`}
                  >
                    {completedWithoutDocumentation}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    Falta subir documentação final
                  </p>
                </div>

                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    completedWithoutDocumentation > 0
                      ? 'bg-yellow-100 text-[#9A7600]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📄
                </div>
              </div>
            </button>
            )}

            {canViewAdminDocumentCards && (
            <button
              type="button"
              onClick={() => applyCardFilter('MISSION_ORDER', 'ACTIVE')}
              className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md text-left ${
                pendingMissionOrder > 0
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      pendingMissionOrder > 0
                        ? 'text-purple-700'
                        : 'text-slate-500'
                    }`}
                  >
                    Pendentes ordem de missão
                  </p>

                  <h2
                    className={`text-3xl lg:text-4xl font-black mt-2 ${
                      pendingMissionOrder > 0
                        ? 'text-purple-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {pendingMissionOrder}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    Jogos ativos sem ordem anexada
                  </p>
                </div>

                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    pendingMissionOrder > 0
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📋
                </div>
              </div>
            </button>
            )}

            <button
              type="button"
              onClick={() => applyCardFilter('COMPLETED', 'DONE')}
              className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md text-left ${
                cardFilter === 'COMPLETED'
                  ? 'bg-[var(--cdb-green-soft)] border-emerald-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Jogos concluídos
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-green)]">
                    {completedMatches}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    {isAdmin ? 'Todos os controles realizados' : 'Meus controles realizados'}
                  </p>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] flex items-center justify-center text-3xl">
                  ✅
                </div>
              </div>
            </button>          </div>

          {isAdmin && (
            <div ref={formRef} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-6 mb-6 lg:mb-8 scroll-mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                    {editingId
                      ? 'Editar jogo'
                      : 'Cadastrar jogo'}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Digite e selecione os dados das listas para cadastrar a partida.
                  </p>
                </div>

                {editingId && (
                  <span className="bg-blue-50 text-[var(--cdb-blue)] border border-slate-200 px-4 py-2 rounded-2xl text-sm font-black">
                    Modo edição
                  </span>
                )}
              </div>

              <datalist id="championships-list">
                {championships.map((championship) => (
                  <option
                    key={championship.id}
                    value={championship.name}
                  />
                ))}
              </datalist>

              <datalist id="stadiums-list">
                {stadiums.map((stadium) => (
                  <option
                    key={stadium.id}
                    value={stadiumLabel(stadium)}
                  />
                ))}
              </datalist>

              <datalist id="teams-list">
                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.name}
                    label={teamLabel(team)}
                  />
                ))}
              </datalist>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3">
                <div className="xl:col-span-4">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Campeonato *
                  </p>

                  <input
                    list="championships-list"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Digite o campeonato"
                    value={championshipName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setChampionshipName(value);

                      const selected =
                        findChampionshipByName(value);

                      setChampionshipId(selected?.id || '');
                    }}
                  />
                </div>

                <div className="xl:col-span-5">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Rodada ou fase *
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_140px]">
                    {(['Rodada', 'Fase'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateRoundOrPhase(type, roundOrPhaseNumber)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                          roundOrPhaseType === type
                            ? 'border-[var(--cdb-blue)] bg-blue-50 text-[var(--cdb-blue)]'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}

                    <input
                      className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                      placeholder="Nº"
                      value={roundOrPhaseNumber}
                      onChange={(e) => updateRoundOrPhase(roundOrPhaseType, e.target.value)}
                    />
                  </div>
                </div>

                <div className="xl:col-span-3">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Nº Jogo *
                  </p>

                  <input
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Ex.: 12"
                    value={matchNumber}
                    onChange={(e) => setMatchNumber(e.target.value)}
                  />
                </div>

                <div className="xl:col-span-3">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Data do jogo *
                  </p>

                  <input
                    type="date"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                  />
                </div>

                <div className="xl:col-span-3">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Horário do jogo *
                  </p>

                  <input
                    type="time"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                  />
                </div>

                <div className="xl:col-span-3">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Time mandante *
                  </p>

                  <input
                    list="teams-list"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Digite o mandante"
                    value={homeTeam}
                    onChange={(e) =>
                      setHomeTeam(e.target.value)
                    }
                  />
                </div>

                <div className="xl:col-span-3">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Time visitante *
                  </p>

                  <input
                    list="teams-list"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Digite o visitante"
                    value={awayTeam}
                    onChange={(e) =>
                      setAwayTeam(e.target.value)
                    }
                  />
                </div>

                <div className="xl:col-span-5">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Estádio *
                  </p>

                  <input
                    list="stadiums-list"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Digite o estádio"
                    value={stadiumName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStadiumName(value);

                      const selected = findStadiumByLabel(value);

                      setStadiumId(selected?.id || '');
                    }}
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-5">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Documento da ordem de missão
                  </p>

                  <input
                    ref={missionOrderFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--cdb-blue)] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                    onChange={(e) =>
                      handleMissionOrderFileChange(e.target.files?.[0] || null)
                    }
                  />

                  <p className="mt-2 px-2 text-xs text-slate-500">
                    Campo opcional. Aceita PDF, Word ou imagem até {MAX_MISSION_ORDER_SIZE_MB}MB.
                  </p>

                  {(missionOrderFile || (editingId && existingMissionOrderFile && !removeMissionOrderFile)) && (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                      {missionOrderFile ? (
                        <p>
                          Novo arquivo selecionado: <strong>{missionOrderFile.fileName}</strong>
                        </p>
                      ) : existingMissionOrderFile ? (
                        <div className="space-y-2">
                          <p>
                            Documento atual: <strong>{existingMissionOrderFile.fileName}</strong>
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              if (existingMissionOrderFile.dataUrl) {
                                downloadDataUrl(
                                  existingMissionOrderFile.dataUrl,
                                  existingMissionOrderFile.fileName || 'ordem-de-missao',
                                );
                                return;
                              }

                              if (!editingId) return;

                              confirmDownloadMatchDocument(
                                {
                                  id: editingId,
                                  homeTeam,
                                  awayTeam,
                                  matchDate: '',
                                  status: '',
                                  championship: { name: championshipName },
                                  stadium: { name: stadiumName, city: '', state: '' },
                                },
                                'mission-order',
                                'a ordem de missão',
                              );
                            }}
                            className="inline-flex rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-[var(--cdb-blue)] transition hover:bg-blue-100"
                          >
                            📄 Baixar documento atual
                          </button>
                        </div>
                      ) : null}

                      {(missionOrderFile || existingMissionOrderFile || missionOrderAnalysis) && (
                        <div
                          className={`mt-3 rounded-2xl border p-3 ${
                            hasComplementaryMissionOrderAnalysis(missionOrderAnalysis)
                              ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                              : 'border-green-100 bg-green-50 text-green-800'
                          }`}
                        >
                          <p className="text-[11px] font-black uppercase tracking-[0.16em]">
                            Análises complementares identificadas
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {getMissionOrderAnalysisDisplay(missionOrderAnalysis)}
                          </p>
                        </div>
                      )}

                      {editingId && (missionOrderFile || existingMissionOrderFile) && (
                        <button
                          type="button"
                          onClick={() => {
                            setMissionOrderFile(null);
                            setExistingMissionOrderFile(null);
                            setMissionOrderAnalysis('');
                            setRemoveMissionOrderFile(true);

                            if (missionOrderFileInputRef.current) {
                              missionOrderFileInputRef.current.value = '';
                            }
                          }}
                          className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                        >
                          Remover documento salvo
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="xl:col-span-2">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Código da missão
                  </p>

                  <input
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Código da missão"
                    value={missionCode}
                    onChange={(e) => setMissionCode(e.target.value)}
                  />
                </div>
              </div>
              {editingId && (
                <div className="mt-4">
                  <p className="mb-2 px-2 text-xs font-bold text-slate-700">
                    Status *
                  </p>

                  <select
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)]"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                  >
                    <option value="SCHEDULED">
                      Agendado
                    </option>

                    <option value="SCALE_ACCEPTED">
                      Escala aceita
                    </option>

                    <option value="IN_PROGRESS">
                      Em andamento
                    </option>

                    <option value="CONTROL_DONE">
                      Controle realizado
                    </option>

                    <option value="CANCELED">
                      Cancelado
                    </option>
                  </select>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  onClick={handleSubmit}
                  className="bg-[var(--cdb-blue)] text-white px-6 py-3 rounded-2xl font-black hover:brightness-90 transition text-center shadow-sm"
                >
                  {editingId
                    ? 'Salvar edição'
                    : 'Cadastrar jogo'}
                </button>

                {editingId && (
                  <button
                    onClick={clearForm}
                    className="bg-slate-100 text-slate-800 px-6 py-3 rounded-2xl font-semibold text-center hover:bg-slate-200 transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-6">
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-black text-[var(--cdb-dark)]">Jogos cadastrados</h2>
                <p className="text-slate-500 mt-1">
                  Controle operacional das partidas.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(360px,1.6fr)_minmax(160px,180px)_minmax(160px,180px)_minmax(220px,0.8fr)]">
                <div>
                  <label className="mb-2 block px-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--cdb-blue)]">
                    Filtrar por campeonato
                  </label>

                  <select
                    className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 font-bold text-[var(--cdb-blue)] outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-[var(--cdb-blue)]/20"
                    value={championshipFilter}
                    onChange={(e) => setChampionshipFilter(e.target.value)}
                  >
                    <option value="">Todos os campeonatos</option>
                    {championshipFilterOptions.map((championship) => (
                      <option key={championship.id} value={championship.id}>
                        {championship.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block px-2 text-xs font-bold text-slate-500">
                    Data inicial
                  </label>

                  <input
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-[var(--cdb-blue)]/30"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block px-2 text-xs font-bold text-slate-500">
                    Data final
                  </label>

                  <input
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-[var(--cdb-blue)]/30"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block px-2 text-xs font-bold text-slate-500">
                    Buscar
                  </label>

                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-[var(--cdb-blue)]/30"
                    placeholder="Missão, jogo, estádio..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={applyTodayDateFilter}
                  className={`w-fit rounded-2xl border px-4 py-2 text-sm font-black transition ${
                    isTodayDateFilterActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-blue-100 bg-blue-50 text-[var(--cdb-blue)] hover:bg-blue-100'
                  }`}
                >
                  📅 Jogos de hoje
                </button>

                {hasListFilters && (
                  <button
                    type="button"
                    onClick={clearListFilters}
                    className="w-fit rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Limpar filtros da lista
                  </button>
                )}
              </div>

              {isAdmin && (
                <div className="hidden rounded-[1.75rem] border border-blue-100 bg-blue-50 p-4 lg:block">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                      Exportação CBF
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      Selecione os jogos no checkbox e gere a planilha Excel CBF.
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {selectedMatches.length} jogo{selectedMatches.length === 1 ? '' : 's'} selecionado{selectedMatches.length === 1 ? '' : 's'}.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={toggleFilteredMatchesSelection}
                      disabled={filteredMatches.length === 0}
                      className="rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-black text-[var(--cdb-blue)] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {hasSelectedAllFilteredMatches ? 'Desmarcar filtrados' : 'Selecionar filtrados'}
                    </button>

                    <button
                      type="button"
                      onClick={clearSelectedMatches}
                      disabled={selectedMatches.length === 0}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Limpar seleção
                    </button>

                    <button
                      type="button"
                      onClick={exportSelectedMatchesToCleanExcel}
                      disabled={selectedMatches.length === 0}
                      className="rounded-2xl bg-[var(--cdb-blue)] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      📊 Excel CBF
                    </button>
                  </div>
                </div>
              </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => applyCardFilter('', 'ACTIVE')}
                className={`px-5 py-3 rounded-2xl font-semibold transition ${
                  activeTab === 'ACTIVE' && !cardFilter
                    ? 'bg-[var(--cdb-blue)] text-white shadow-sm'
                    : 'bg-white text-[var(--cdb-blue)] border border-slate-200 hover:bg-[var(--cdb-blue-soft)]'
                }`}
              >
                Jogos ativos ({activeMatches})
              </button>

              <button
                onClick={() => applyCardFilter('', 'DONE')}
                className={`px-5 py-3 rounded-2xl font-semibold transition ${
                  activeTab === 'DONE' && !cardFilter
                    ? 'bg-[var(--cdb-green)] text-white shadow-sm'
                    : 'bg-white text-[var(--cdb-blue)] border border-slate-200 hover:bg-[var(--cdb-blue-soft)]'
                }`}
              >
                Jogos concluídos ({doneMatches})
              </button>
            </div>

            <div className="lg:hidden space-y-5">
              {filteredMatches.map((match) => (
                <article
                  key={match.id}
                  className="overflow-hidden rounded-[2rem] border-2 border-slate-300 bg-white shadow-md"
                >
                  <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
                    <div className="space-y-3">
                      <div className="min-w-0 w-full">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                          Competição
                        </p>

                        <div className="mt-1 rounded-2xl border border-blue-100 bg-white/80 px-3 py-2">
                          <h3 className="w-full break-words text-lg font-black leading-snug text-[var(--cdb-blue)] sm:text-xl">
                            {match.championship.name}
                          </h3>
                        </div>

                        <p className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Partida
                        </p>

                        <div className="mt-1 flex w-full flex-wrap items-center gap-2 text-xl font-black leading-snug text-[var(--cdb-dark)] sm:text-2xl">
                          {renderTeamShortName(
                            match.homeTeam,
                            `${match.id}-mobile-home`,
                            'mobile',
                          )}
                          <span aria-hidden="true">x</span>
                          {renderTeamShortName(
                            match.awayTeam,
                            `${match.id}-mobile-away`,
                            'mobile',
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {match.missionCode ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-white px-3 py-1.5 text-xs font-black text-[var(--cdb-blue)]">
                          🎯 Missão: {getMissionCodeDisplay(match.missionCode)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500">
                          🎯 Missão: sem código
                        </span>
                      )}

                      {hasMissionOrder(match) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-black text-purple-700">
                          📄 Ordem: anexada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500">
                          📄 Ordem: pendente
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                        Nº jogo: {match.matchNumber || '-'}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                        Rodada/Fase: {match.roundOrPhase || '-'}
                      </span>

                      {hasMissionOrder(match) && (
                        <span
                          className={`inline-flex max-w-full items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black ${
                            hasComplementaryMissionOrderAnalysis(match.missionOrderAnalysis)
                              ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                              : 'border-green-100 bg-green-50 text-green-800'
                          }`}
                        >
                          🧪 Análises: {getMissionOrderAnalysisDisplay(match.missionOrderAnalysis)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Local
                        </p>

                        <p className="mt-1 font-black text-slate-800">
                          🏟️ {match.stadium.name}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {match.stadium.city}/{match.stadium.state}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--cdb-blue)]">
                            Data
                          </p>

                          <p className="mt-1 font-black text-slate-900">
                            {formatDate(match.matchDate)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
                            Horário
                          </p>

                          <p className="mt-1 font-black text-slate-900">
                            {formatTime(match.matchDate)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Oficiais escalados
                        </p>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {(['DCO', 'ASSISTANT'] as const).map((role) => {
                            const scale = getMatchOfficial(match, role);
                            const label = role === 'DCO' ? 'DCO' : 'Oficial';

                            return (
                              <div
                                key={`${match.id}-mobile-${role}`}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                      {label}
                                    </p>
                                    <p className="mt-1 break-words text-sm font-black text-slate-900">
                                      {getMatchOfficialName(match, role)}
                                    </p>
                                  </div>

                                  {scale && (
                                    <span className={`${getOfficialConfirmationClass(scale.confirmed)} shrink-0 rounded-full border px-2 py-1 text-[10px] font-black`}>
                                      {getOfficialConfirmationLabel(scale.confirmed)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {canViewMatchFiles && hasAnyMatchDocument(match) && (
                      <div className="rounded-2xl border border-purple-100 bg-purple-50 p-3">
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-purple-700">
                          Documentos
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {hasMissionOrder(match) && (
                            <button
                              type="button"
                              onClick={() =>
                                confirmDownloadMatchDocument(
                                  match,
                                  'mission-order',
                                  'a ordem de missão',
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-100"
                            >
                              📄 O. Missão
                            </button>
                          )}

                          {hasAthleteList(match) && (
                            <button
                              type="button"
                              onClick={() =>
                                confirmDownloadMatchDocument(
                                  match,
                                  'athlete-list',
                                  'a relação de atletas',
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-[var(--cdb-blue)] transition hover:bg-blue-100"
                            >
                              👥 Relação A.
                            </button>
                          )}

                          {hasFinalDocumentation(match) && (
                            <button
                              type="button"
                              onClick={() =>
                                confirmDownloadMatchDocument(
                                  match,
                                  'final-document',
                                  'a documentação do jogo',
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              📎 Doc Final
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                      {canOpenMatchOperation(match) ? (
                        <Link
                          href={`/dashboard/matches/${match.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          🧪 Abrir operação
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title={
                            userRole === 'OFFICIAL' && match.status === 'CONTROL_DONE'
                              ? 'Operação finalizada. Oficiais não têm acesso após a conclusão.'
                              : 'A operação será liberada a partir do dia do jogo.'
                          }
                          className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-400"
                        >
                          🧪 Operação indisponível
                        </button>
                      )}

                      {isAdmin && match.status !== 'CONTROL_DONE' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(match)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-black text-[var(--cdb-blue)] transition hover:bg-blue-100"
                          >
                            ✏️ Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteMatch(match.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden lg:block">
              {selectedChampionshipFilter ? (
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        Campeonato filtrado
                      </p>

                      <h3 className="mt-1 text-xl font-black text-[var(--cdb-dark)]">
                        {selectedChampionshipFilter.name}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {filteredMatches.length} jogo{filteredMatches.length === 1 ? '' : 's'} encontrado{filteredMatches.length === 1 ? '' : 's'}.
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-[var(--cdb-blue)]">
                      Filtro por campeonato ativo
                    </span>
                  </div>

                  {renderDesktopMatchesTable(filteredMatches)}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Todos os campeonatos
                    </p>

                    <h3 className="mt-1 text-xl font-black text-[var(--cdb-dark)]">
                      Jogos agrupados por campeonato
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {filteredMatches.length} jogo{filteredMatches.length === 1 ? '' : 's'} encontrado{filteredMatches.length === 1 ? '' : 's'} em {groupedFilteredMatchesByChampionship.length} campeonato{groupedFilteredMatchesByChampionship.length === 1 ? '' : 's'}.
                    </p>
                  </div>

                  {groupedFilteredMatchesByChampionship.map((group) => (
                    <section
                      key={group.id}
                      className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="flex flex-col gap-2 border-b border-blue-100 bg-blue-50 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                            Campeonato
                          </p>

                          <h3 className="mt-1 text-xl font-black text-[var(--cdb-blue)]">
                            {group.name}
                          </h3>
                        </div>

                        <span className="inline-flex w-fit rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-black text-[var(--cdb-blue)]">
                          {group.matches.length} jogo{group.matches.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {renderDesktopMatchesTable(group.matches)}
                    </section>
                  ))}
                </div>
              )}
            </div>

            {filteredMatches.length === 0 && (
              <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center mt-6">
                <div className="text-6xl mb-4">
                  ⚽
                </div>

                <h3 className="text-xl font-bold">
                  Nenhum jogo encontrado
                </h3>

                <p className="text-slate-500 mt-2">
                  Cadastre um jogo ou ajuste sua busca.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onCancel={closeModal}
        onConfirm={modal.onConfirm || closeModal}
      />
    </main>
  );
}
