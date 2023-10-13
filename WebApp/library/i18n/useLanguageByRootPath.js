// node modules
import { useEffect } from "react";
import { useRouter } from "next/router";

// local modules
import { i18n } from "./index";

const useLanguageByRootPath = () => {
  const {
    query: { lang },
  } = useRouter();

  useEffect(() => {
    const localePath = Object.keys(i18n.options.localeSubpaths).find((key) => {
      return i18n.options.localeSubpaths[key] === lang;
    });

    if (i18n.language !== localePath) {
      // console.log("Change Language.", i18n.language, localePath);
      i18n.changeLanguage(localePath);
    }
  }, [lang]);
};

export default useLanguageByRootPath;
