import { useI18n } from "../i18n";

const options = [
  { value: "en", label: "EN" },
  { value: "zh-CN", label: "中文" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-0 text-[10px] font-bold tracking-[0.15em] opacity-60">
      {options.map((opt, i) => (
        <span key={opt.value} className="flex items-center gap-0">
          {i > 0 && (
            <span className="mx-2 w-px h-3 bg-black/20" aria-hidden="true" />
          )}
          <button
            onClick={() => setLocale(opt.value)}
            className={`uppercase transition-colors duration-300 hover:opacity-100 ${
              locale === opt.value
                ? "text-tertiary opacity-100"
                : "hover:text-on-surface"
            }`}
            aria-label={`Switch to ${opt.label}`}
            aria-current={locale === opt.value ? "true" : undefined}
          >
            {opt.label}
          </button>
        </span>
      ))}
    </div>
  );
}
