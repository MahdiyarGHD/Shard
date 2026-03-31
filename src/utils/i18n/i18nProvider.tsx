import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { translation as en } from "./locales/en";
import { translation as fa } from "./locales/fa";

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & string]: ObjectType[Key] extends object
        ? // @ts-expect-error we don't know
          `${Key}${DotPrefix<NestedKeyOf<ObjectType[Key]>>}`
        : Key;
}[keyof ObjectType & string];

type TranslationKeys = NestedKeyOf<typeof en>;

interface I18nContextProps {
    t: (path: TranslationKeys, vars?: Record<string, string | number>) => string;
    language: Lang;
    setLanguage: (lang: Lang) => void;
}

export const locales = ["en", "fa"] as const;

export const localeFlags: { [key in Locale]: string } = {
    en: "🇺🇸",
    fa: "🇮🇷",
};

export const localeDirections: { [key in Locale]: string } = {
    en: "ltr",
    fa: "rtl",
};

import { getNestedValue, interpolate } from "./utils";

const allTranslations = {
    en,
    fa,
};

export type Lang = keyof typeof allTranslations;

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Lang>(() => {
        return localStorage.getItem("lang")
            ? JSON.parse(localStorage.getItem("lang") || "")
            : "en";
    });

    const t = (path: string, vars?: Record<string, string | number>): string => {
        const langPack = allTranslations[language];
        const value = getNestedValue(langPack, path);
        return value ? interpolate(value, vars) : path;
    };

    useEffect(() => {
        document.querySelector("html")?.setAttribute("dir", localeDirections[language]);
    }, [language]);

    return (
        <I18nContext.Provider value={{ t, language, setLanguage }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error("useTranslation must be used within I18nProvider");
    return context;
};

export type Locale = (typeof locales)[number];
