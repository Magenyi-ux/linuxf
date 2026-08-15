import { ExamType, Question, Subject } from "../types";
import { visualQuestionsBySubject } from "./visualQuestions";

// Import all JSON files from the questions directory.
const questionFiles = import.meta.glob("./questions/*.json", { eager: true });

type RawOptions = Record<string, string | undefined> | string[];

interface RawQuestion {
  id: number | string;
  question?: string;
  questionText?: string;
  text?: string;
  options?: RawOptions;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  year_id?: string | number;
  correctOptionIndex?: number;
  correctAnswer?: string;
  answer?: string;
  explanation?: string;
  solution?: string;
  imageUrl?: string;
  image_url?: string;
  imageAlt?: string;
  image_alt?: string;
  year?: string | number;
  examType?: string;
}

const subjectToFilename: Record<string, string> = {
  [Subject.MATHEMATICS]: "mathematics",
  [Subject.ENGLISH]: "english-language",
  [Subject.PHYSICS]: "physics",
  [Subject.CHEMISTRY]: "chemistry",
  [Subject.BIOLOGY]: "biology",
  [Subject.FURTHER_MATHS]: "further-mathematics",
  [Subject.AGRIC_SCIENCE]: "agricultural-science",
  [Subject.GEOGRAPHY]: "geography",
  [Subject.ECONOMICS]: "economics",
  [Subject.COMMERCE]: "commerce",
  [Subject.GOVERNMENT]: "government",
  [Subject.LITERATURE]: "literature-in-english",
  [Subject.HISTORY]: "history",
  [Subject.CIVIC_EDUCATION]: "civic-education",
  [Subject.CRS]: "crs",
  [Subject.IRS]: "irs",
  [Subject.FRENCH]: "french",
  [Subject.ARABIC]: "arabic",
};

const boardQuestionFiles: Record<string, string> = {
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2026`]: "./questions/jamb_mathematics_2026_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2026`]: "./questions/waec_mathematics_2026_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2026`]: "./questions/neco_mathematics_2026_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2025`]: "./questions/jamb_mathematics_2025_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2025`]: "./questions/waec_mathematics_2025_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2025`]: "./questions/neco_mathematics_2025_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2024`]: "./questions/jamb_mathematics_2024_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2024`]: "./questions/waec_mathematics_2024_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2024`]: "./questions/neco_mathematics_2024_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2023`]: "./questions/jamb_mathematics_2023_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2023`]: "./questions/waec_mathematics_2023_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2023`]: "./questions/neco_mathematics_2023_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2022`]: "./questions/jamb_mathematics_2022_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2022`]: "./questions/waec_mathematics_2022_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2022`]: "./questions/neco_mathematics_2022_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2021`]: "./questions/jamb_mathematics_2021_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2021`]: "./questions/waec_mathematics_2021_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2021`]: "./questions/neco_mathematics_2021_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2020`]: "./questions/jamb_mathematics_2020_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2020`]: "./questions/waec_mathematics_2020_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2020`]: "./questions/neco_mathematics_2020_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2019`]: "./questions/jamb_mathematics_2019_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2019`]: "./questions/waec_mathematics_2019_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2019`]: "./questions/neco_mathematics_2019_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2018`]: "./questions/jamb_mathematics_2018_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2018`]: "./questions/waec_mathematics_2018_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2018`]: "./questions/neco_mathematics_2018_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2017`]: "./questions/jamb_mathematics_2017_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2017`]: "./questions/waec_mathematics_2017_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2017`]: "./questions/neco_mathematics_2017_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2016`]: "./questions/jamb_mathematics_2016_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2016`]: "./questions/waec_mathematics_2016_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2016`]: "./questions/neco_mathematics_2016_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2015`]: "./questions/jamb_mathematics_2015_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2015`]: "./questions/waec_mathematics_2015_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2015`]: "./questions/neco_mathematics_2015_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2014`]: "./questions/jamb_mathematics_2014_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2014`]: "./questions/waec_mathematics_2014_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2014`]: "./questions/neco_mathematics_2014_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2013`]: "./questions/jamb_mathematics_2013_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2013`]: "./questions/waec_mathematics_2013_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2013`]: "./questions/neco_mathematics_2013_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2012`]: "./questions/jamb_mathematics_2012_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2012`]: "./questions/waec_mathematics_2012_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2012`]: "./questions/neco_mathematics_2012_practice.json",
  [`${ExamType.JAMB}:${Subject.MATHEMATICS}:2011`]: "./questions/jamb_mathematics_2011_practice.json",
  [`${ExamType.WAEC}:${Subject.MATHEMATICS}:2011`]: "./questions/waec_mathematics_2011_practice.json",
  [`${ExamType.NECO}:${Subject.MATHEMATICS}:2011`]: "./questions/neco_mathematics_2011_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2026`]: "./questions/jamb_english_language_2026_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2026`]: "./questions/waec_english_language_2026_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2026`]: "./questions/neco_english_language_2026_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2025`]: "./questions/jamb_english_language_2025_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2025`]: "./questions/waec_english_language_2025_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2025`]: "./questions/neco_english_language_2025_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2024`]: "./questions/jamb_english_language_2024_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2024`]: "./questions/waec_english_language_2024_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2024`]: "./questions/neco_english_language_2024_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2023`]: "./questions/jamb_english_language_2023_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2023`]: "./questions/waec_english_language_2023_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2023`]: "./questions/neco_english_language_2023_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2022`]: "./questions/jamb_english_language_2022_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2022`]: "./questions/waec_english_language_2022_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2022`]: "./questions/neco_english_language_2022_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2021`]: "./questions/jamb_english_language_2021_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2021`]: "./questions/waec_english_language_2021_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2021`]: "./questions/neco_english_language_2021_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2020`]: "./questions/jamb_english_language_2020_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2020`]: "./questions/waec_english_language_2020_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2020`]: "./questions/neco_english_language_2020_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2019`]: "./questions/jamb_english_language_2019_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2019`]: "./questions/waec_english_language_2019_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2019`]: "./questions/neco_english_language_2019_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2018`]: "./questions/jamb_english_language_2018_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2018`]: "./questions/waec_english_language_2018_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2018`]: "./questions/neco_english_language_2018_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2017`]: "./questions/jamb_english_language_2017_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2017`]: "./questions/waec_english_language_2017_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2017`]: "./questions/neco_english_language_2017_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2016`]: "./questions/jamb_english_language_2016_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2016`]: "./questions/waec_english_language_2016_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2016`]: "./questions/neco_english_language_2016_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2015`]: "./questions/jamb_english_language_2015_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2015`]: "./questions/waec_english_language_2015_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2015`]: "./questions/neco_english_language_2015_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2014`]: "./questions/jamb_english_language_2014_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2014`]: "./questions/waec_english_language_2014_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2014`]: "./questions/neco_english_language_2014_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2013`]: "./questions/jamb_english_language_2013_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2013`]: "./questions/waec_english_language_2013_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2013`]: "./questions/neco_english_language_2013_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2012`]: "./questions/jamb_english_language_2012_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2012`]: "./questions/waec_english_language_2012_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2012`]: "./questions/neco_english_language_2012_practice.json",
  [`${ExamType.JAMB}:${Subject.ENGLISH}:2011`]: "./questions/jamb_english_language_2011_practice.json",
  [`${ExamType.WAEC}:${Subject.ENGLISH}:2011`]: "./questions/waec_english_language_2011_practice.json",
  [`${ExamType.NECO}:${Subject.ENGLISH}:2011`]: "./questions/neco_english_language_2011_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2026`]: "./questions/jamb_economics_2026_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2026`]: "./questions/waec_economics_2026_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2026`]: "./questions/neco_economics_2026_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2025`]: "./questions/jamb_economics_2025_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2025`]: "./questions/waec_economics_2025_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2025`]: "./questions/neco_economics_2025_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2024`]: "./questions/jamb_economics_2024_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2024`]: "./questions/waec_economics_2024_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2024`]: "./questions/neco_economics_2024_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2023`]: "./questions/jamb_economics_2023_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2023`]: "./questions/waec_economics_2023_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2023`]: "./questions/neco_economics_2023_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2022`]: "./questions/jamb_economics_2022_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2022`]: "./questions/waec_economics_2022_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2022`]: "./questions/neco_economics_2022_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2021`]: "./questions/jamb_economics_2021_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2021`]: "./questions/waec_economics_2021_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2021`]: "./questions/neco_economics_2021_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2020`]: "./questions/jamb_economics_2020_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2020`]: "./questions/waec_economics_2020_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2020`]: "./questions/neco_economics_2020_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2019`]: "./questions/jamb_economics_2019_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2019`]: "./questions/waec_economics_2019_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2019`]: "./questions/neco_economics_2019_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2018`]: "./questions/jamb_economics_2018_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2018`]: "./questions/waec_economics_2018_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2018`]: "./questions/neco_economics_2018_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2017`]: "./questions/jamb_economics_2017_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2017`]: "./questions/waec_economics_2017_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2017`]: "./questions/neco_economics_2017_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2016`]: "./questions/jamb_economics_2016_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2016`]: "./questions/waec_economics_2016_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2016`]: "./questions/neco_economics_2016_practice.json",
  [`${ExamType.JAMB}:${Subject.ECONOMICS}:2015`]: "./questions/jamb_economics_2015_practice.json",
  [`${ExamType.WAEC}:${Subject.ECONOMICS}:2015`]: "./questions/waec_economics_2015_practice.json",
  [`${ExamType.NECO}:${Subject.ECONOMICS}:2015`]: "./questions/neco_economics_2015_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2025`]: "./questions/jamb_chemistry_2025_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2025`]: "./questions/waec_chemistry_2025_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2025`]: "./questions/neco_chemistry_2025_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2026`]: "./questions/jamb_chemistry_2026_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2026`]: "./questions/waec_chemistry_2026_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2026`]: "./questions/neco_chemistry_2026_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2024`]: "./questions/jamb_chemistry_2024_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2024`]: "./questions/waec_chemistry_2024_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2024`]: "./questions/neco_chemistry_2024_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2023`]: "./questions/jamb_chemistry_2023_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2023`]: "./questions/waec_chemistry_2023_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2023`]: "./questions/neco_chemistry_2023_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2022`]: "./questions/jamb_chemistry_2022_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2022`]: "./questions/waec_chemistry_2022_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2022`]: "./questions/neco_chemistry_2022_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2021`]: "./questions/jamb_chemistry_2021_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2021`]: "./questions/waec_chemistry_2021_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2021`]: "./questions/neco_chemistry_2021_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2020`]: "./questions/jamb_chemistry_2020_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2020`]: "./questions/waec_chemistry_2020_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2020`]: "./questions/neco_chemistry_2020_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2019`]: "./questions/jamb_chemistry_2019_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2019`]: "./questions/waec_chemistry_2019_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2019`]: "./questions/neco_chemistry_2019_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2018`]: "./questions/jamb_chemistry_2018_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2018`]: "./questions/waec_chemistry_2018_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2018`]: "./questions/neco_chemistry_2018_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2017`]: "./questions/jamb_chemistry_2017_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2017`]: "./questions/waec_chemistry_2017_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2017`]: "./questions/neco_chemistry_2017_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2016`]: "./questions/jamb_chemistry_2016_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2016`]: "./questions/waec_chemistry_2016_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2016`]: "./questions/neco_chemistry_2016_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2015`]: "./questions/jamb_chemistry_2015_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2015`]: "./questions/waec_chemistry_2015_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2015`]: "./questions/neco_chemistry_2015_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2014`]: "./questions/jamb_chemistry_2014_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2014`]: "./questions/waec_chemistry_2014_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2014`]: "./questions/neco_chemistry_2014_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2013`]: "./questions/jamb_chemistry_2013_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2013`]: "./questions/waec_chemistry_2013_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2013`]: "./questions/neco_chemistry_2013_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2012`]: "./questions/jamb_chemistry_2012_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2012`]: "./questions/waec_chemistry_2012_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2012`]: "./questions/neco_chemistry_2012_practice.json",
  [`${ExamType.JAMB}:${Subject.CHEMISTRY}:2011`]: "./questions/jamb_chemistry_2011_practice.json",
  [`${ExamType.WAEC}:${Subject.CHEMISTRY}:2011`]: "./questions/waec_chemistry_2011_practice.json",
  [`${ExamType.NECO}:${Subject.CHEMISTRY}:2011`]: "./questions/neco_chemistry_2011_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2025`]: "./questions/jamb_biology_2025_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2025`]: "./questions/waec_biology_2025_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2025`]: "./questions/neco_biology_2025_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2026`]: "./questions/jamb_biology_2026_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2026`]: "./questions/waec_biology_2026_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2026`]: "./questions/neco_biology_2026_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2024`]: "./questions/jamb_biology_2024_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2024`]: "./questions/waec_biology_2024_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2024`]: "./questions/neco_biology_2024_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2023`]: "./questions/jamb_biology_2023_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2023`]: "./questions/waec_biology_2023_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2023`]: "./questions/neco_biology_2023_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2022`]: "./questions/jamb_biology_2022_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2022`]: "./questions/waec_biology_2022_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2022`]: "./questions/neco_biology_2022_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2021`]: "./questions/jamb_biology_2021_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2021`]: "./questions/waec_biology_2021_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2021`]: "./questions/neco_biology_2021_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2020`]: "./questions/jamb_biology_2020_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2020`]: "./questions/waec_biology_2020_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2020`]: "./questions/neco_biology_2020_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2019`]: "./questions/jamb_biology_2019_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2019`]: "./questions/waec_biology_2019_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2019`]: "./questions/neco_biology_2019_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2018`]: "./questions/jamb_biology_2018_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2018`]: "./questions/waec_biology_2018_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2018`]: "./questions/neco_biology_2018_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2017`]: "./questions/jamb_biology_2017_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2017`]: "./questions/waec_biology_2017_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2017`]: "./questions/neco_biology_2017_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2016`]: "./questions/jamb_biology_2016_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2016`]: "./questions/waec_biology_2016_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2016`]: "./questions/neco_biology_2016_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2015`]: "./questions/jamb_biology_2015_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2015`]: "./questions/waec_biology_2015_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2015`]: "./questions/neco_biology_2015_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2014`]: "./questions/jamb_biology_2014_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2014`]: "./questions/waec_biology_2014_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2014`]: "./questions/neco_biology_2014_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2013`]: "./questions/jamb_biology_2013_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2013`]: "./questions/waec_biology_2013_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2013`]: "./questions/neco_biology_2013_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2012`]: "./questions/jamb_biology_2012_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2012`]: "./questions/waec_biology_2012_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2012`]: "./questions/neco_biology_2012_practice.json",
  [`${ExamType.JAMB}:${Subject.BIOLOGY}:2011`]: "./questions/jamb_biology_2011_practice.json",
  [`${ExamType.WAEC}:${Subject.BIOLOGY}:2011`]: "./questions/waec_biology_2011_practice.json",
  [`${ExamType.NECO}:${Subject.BIOLOGY}:2011`]: "./questions/neco_biology_2011_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2025`]: "./questions/jamb_physics_2025_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2026`]: "./questions/jamb_physics_2026_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2026`]: "./questions/waec_physics_2026_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2026`]: "./questions/neco_physics_2026_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2025`]: "./questions/waec_physics_2025_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2025`]: "./questions/neco_physics_2025_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2024`]: "./questions/jamb_physics_2024_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2024`]: "./questions/waec_physics_2024_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2024`]: "./questions/neco_physics_2024_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2023`]: "./questions/jamb_physics_2023_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2023`]: "./questions/waec_physics_2023_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2023`]: "./questions/neco_physics_2023_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2022`]: "./questions/jamb_physics_2022_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2022`]: "./questions/waec_physics_2022_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2022`]: "./questions/neco_physics_2022_practice.json",
  [`${ExamType.JAMB}:${Subject.GOVERNMENT}:2015`]: "./questions/jamb_government_2015_practice.json",
  [`${ExamType.WAEC}:${Subject.GOVERNMENT}:2015`]: "./questions/waec_government_2015_practice.json",
  [`${ExamType.NECO}:${Subject.GOVERNMENT}:2015`]: "./questions/neco_government_2015_practice.json",
  [`${ExamType.JAMB}:${Subject.GOVERNMENT}:2016`]: "./questions/jamb_government_2016_practice.json",
  [`${ExamType.WAEC}:${Subject.GOVERNMENT}:2016`]: "./questions/waec_government_2016_practice.json",
  [`${ExamType.JAMB}:${Subject.GOVERNMENT}:2017`]: "./questions/jamb_government_2017_practice.json",
  [`${ExamType.JAMB}:${Subject.GOVERNMENT}:2018`]: "./questions/jamb_government_2018_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2021`]: "./questions/jamb_physics_2021_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2021`]: "./questions/waec_physics_2021_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2021`]: "./questions/neco_physics_2021_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2020`]: "./questions/jamb_physics_2020_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2020`]: "./questions/waec_physics_2020_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2020`]: "./questions/neco_physics_2020_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2019`]: "./questions/jamb_physics_2019_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2019`]: "./questions/waec_physics_2019_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2019`]: "./questions/neco_physics_2019_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2018`]: "./questions/jamb_physics_2018_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2018`]: "./questions/waec_physics_2018_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2018`]: "./questions/neco_physics_2018_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2017`]: "./questions/jamb_physics_2017_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2017`]: "./questions/waec_physics_2017_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2017`]: "./questions/neco_physics_2017_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2016`]: "./questions/jamb_physics_2016_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2016`]: "./questions/waec_physics_2016_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2016`]: "./questions/neco_physics_2016_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2015`]: "./questions/jamb_physics_2015_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2015`]: "./questions/waec_physics_2015_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2015`]: "./questions/neco_physics_2015_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2014`]: "./questions/jamb_physics_2014_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2014`]: "./questions/waec_physics_2014_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2014`]: "./questions/neco_physics_2014_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2013`]: "./questions/jamb_physics_2013_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2013`]: "./questions/waec_physics_2013_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2013`]: "./questions/neco_physics_2013_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2012`]: "./questions/jamb_physics_2012_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2012`]: "./questions/waec_physics_2012_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2012`]: "./questions/neco_physics_2012_practice.json",
  [`${ExamType.JAMB}:${Subject.PHYSICS}:2011`]: "./questions/jamb_physics_2011_practice.json",
  [`${ExamType.WAEC}:${Subject.PHYSICS}:2011`]: "./questions/waec_physics_2011_practice.json",
  [`${ExamType.NECO}:${Subject.PHYSICS}:2011`]: "./questions/neco_physics_2011_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2026`]: "./questions/jamb_irs_2026_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2026`]: "./questions/waec_irs_2026_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2026`]: "./questions/neco_irs_2026_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2025`]: "./questions/jamb_irs_2025_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2025`]: "./questions/waec_irs_2025_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2025`]: "./questions/neco_irs_2025_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2024`]: "./questions/jamb_irs_2024_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2024`]: "./questions/waec_irs_2024_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2024`]: "./questions/neco_irs_2024_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2023`]: "./questions/jamb_irs_2023_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2023`]: "./questions/waec_irs_2023_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2023`]: "./questions/neco_irs_2023_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2022`]: "./questions/jamb_irs_2022_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2022`]: "./questions/waec_irs_2022_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2022`]: "./questions/neco_irs_2022_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2021`]: "./questions/jamb_irs_2021_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2021`]: "./questions/waec_irs_2021_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2021`]: "./questions/neco_irs_2021_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2020`]: "./questions/jamb_irs_2020_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2020`]: "./questions/waec_irs_2020_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2020`]: "./questions/neco_irs_2020_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2019`]: "./questions/jamb_irs_2019_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2019`]: "./questions/waec_irs_2019_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2019`]: "./questions/neco_irs_2019_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2018`]: "./questions/jamb_irs_2018_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2018`]: "./questions/waec_irs_2018_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2018`]: "./questions/neco_irs_2018_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2017`]: "./questions/jamb_irs_2017_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2017`]: "./questions/waec_irs_2017_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2017`]: "./questions/neco_irs_2017_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2016`]: "./questions/jamb_irs_2016_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2016`]: "./questions/waec_irs_2016_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2016`]: "./questions/neco_irs_2016_practice.json",
  [`${ExamType.JAMB}:${Subject.IRS}:2015`]: "./questions/jamb_irs_2015_practice.json",
  [`${ExamType.WAEC}:${Subject.IRS}:2015`]: "./questions/waec_irs_2015_practice.json",
  [`${ExamType.NECO}:${Subject.IRS}:2015`]: "./questions/neco_irs_2015_practice.json",
  // Commerce (Mapped to the consolidated file for all years)
  ...Array.from({ length: 16 }, (_, i) => 2011 + i).reduce((acc, year) => ({
    ...acc,
    [`${ExamType.JAMB}:${Subject.COMMERCE}:${year}`]: "./questions/commerce_questions.json",
    [`${ExamType.WAEC}:${Subject.COMMERCE}:${year}`]: "./questions/commerce_questions.json",
    [`${ExamType.NECO}:${Subject.COMMERCE}:${year}`]: "./questions/commerce_questions.json",
  }), {}),
  // Further Mathematics
  ...Array.from({ length: 10 }, (_, i) => 2011 + i).reduce((acc, year) => ({
    ...acc,
    [`${ExamType.JAMB}:${Subject.FURTHER_MATHS}:${year}`]: "./questions/further-mathematics_questions.json",
    [`${ExamType.WAEC}:${Subject.FURTHER_MATHS}:${year}`]: "./questions/further-mathematics_questions.json",
    [`${ExamType.NECO}:${Subject.FURTHER_MATHS}:${year}`]: "./questions/further-mathematics_questions.json",
  }), {}),
};

const optionKeys = ["a", "b", "c", "d", "A", "B", "C", "D"] as const;

const extractOptions = (question: RawQuestion): string[] => {
  if (Array.isArray(question.options)) {
    return question.options.filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim());
  }

  if (question.options && typeof question.options === "object") {
    const optionRecord = question.options as Record<string, string | undefined>;
    return optionKeys
      .map((key) => optionRecord[key])
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => value.trim());
  }

  return [
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d,
    question.optionA,
    question.optionB,
    question.optionC,
    question.optionD,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim()).slice(0, 4);
};

const parseCorrectOptionIndex = (question: RawQuestion): number | null => {
  if (typeof question.correctOptionIndex === "number" && question.correctOptionIndex >= 0 && question.correctOptionIndex <= 3) {
    return question.correctOptionIndex;
  }

  const rawAnswer = question.correctAnswer ?? question.answer;
  if (typeof rawAnswer !== "string") return null;
  const normalized = rawAnswer.trim().toUpperCase();
  if (/^[A-D]$/.test(normalized)) return normalized.charCodeAt(0) - 65;
  const numeric = Number(normalized);
  return Number.isInteger(numeric) && numeric >= 0 && numeric <= 3 ? numeric : null;
};

/** Loads and adapts complete questions from local JSON files. */
export const getLocalQuestions = (
  subject: Subject,
  year: string,
  count: number = 10,
  examType?: ExamType,
): { questions: Question[]; sources: string[] } | null => {
  const filename = subjectToFilename[subject];
  if (!filename) return null;

  const filePath = boardQuestionFiles[`${examType ?? ""}:${subject}:${year}`] ?? `./questions/${filename}_questions.json`;
  const fileData = (questionFiles[filePath] as { default?: RawQuestion[] } | undefined)?.default;

  if (!fileData || !Array.isArray(fileData)) {
    if (subject === Subject.ECONOMICS) {
      const altPath = "./questions/myschool_economics_questions.json";
      const altData = (questionFiles[altPath] as { default?: RawQuestion[] } | undefined)?.default;
      if (altData && Array.isArray(altData)) return processRawData(altData, year, count, subject);
    }
    return null;
  }

  return processRawData(fileData, year, count, subject);
};

const processRawData = (
  data: RawQuestion[],
  year: string,
  count: number,
  subject: Subject,
): { questions: Question[]; sources: string[] } | null => {
  const filtered = year === "Random" ? data : data.filter((question) => String(question.year_id ?? question.year ?? "") === String(year));
  const visualQuestions = year === "Random" ? (visualQuestionsBySubject[subject] ?? []) : [];
  if (filtered.length === 0 && visualQuestions.length === 0) return null;

  const selected = [...filtered].sort(() => Math.random() - 0.5).slice(0, Math.max(0, count - visualQuestions.length));
  const transformed: Question[] = selected.flatMap((question) => {
    const options = extractOptions(question).slice(0, 4);
    const correctOptionIndex = parseCorrectOptionIndex(question);
    const explanation = (question.explanation ?? question.solution ?? "").trim();
    const text = (question.question ?? question.questionText ?? question.text ?? "").trim();

    // Never surface a malformed record: every quiz item must have four choices,
    // a valid correct-answer index, and a meaningful explanation.
    if (!text || options.length !== 4 || correctOptionIndex === null || explanation.length < 20) return [];

    return [{
      id: `local_${subject.toLowerCase().replace(/\s+/g, "_")}_${question.id}`,
      text,
      imageUrl: question.imageUrl ?? question.image_url,
      imageAlt: question.imageAlt ?? question.image_alt ?? "Question illustration",
      options,
      correctOptionIndex,
      explanation,
    }];
  });

  const combined = [...visualQuestions, ...transformed].slice(0, count);
  if (combined.length === 0) return null;
  return { questions: combined, sources: ["Local Question Bank (Vetted)", "Original syllabus-aligned practice"] };
};
