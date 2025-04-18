import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import useSearch from '@/hooks/useSearch';
import searchIcon from '../../assets/iconSvg/searchIconBlack.svg';

type Props = {
  searchActive: any;
  setSearchActive: any;
};

export function SearchInput(props: Props) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, setSearch, animError, searchEvent } = useSearch();
  
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  useEffect(() => {
    const encodedStoredHistory = localStorage.getItem('searchHistory');
    const storedHistory: string[] = encodedStoredHistory ? JSON.parse(encodedStoredHistory) : [];
    if (!storedHistory.includes(router.query.id as string)) {
      if (storedHistory.length >= 10) {
        storedHistory.pop();
      }
      if (router.query.id) {
        storedHistory.unshift(router.query.id as string);
      }
    } else {
      const index = storedHistory.indexOf(router.query.id as string);
      storedHistory.splice(index, 1);
      storedHistory.unshift(router.query.id as string);
    }
    localStorage.setItem('searchHistory', JSON.stringify(storedHistory));
    setSearchHistory(storedHistory);
  }, [router.query.id]);
  
  useEffect(() => {
    if (props.searchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [props.searchActive]);
  
  return (
    <div className="main-header__container__center">
      <div
        className={
          animError
            ? 'main-header__container__center__input main-header__container__center__searchError'
            : 'main-header__container__center__input'
        }
      >
        <input
          type="text"
          placeholder={t('Header.Search.Placeholder')}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
          }}
          onKeyDown={e => {
            e.key === 'Enter' ? searchEvent() : null;
          }}
          ref={inputRef}
        />
        <div onClick={searchEvent}>
          <Image src={searchIcon} alt="search icon" />
        </div>
      </div>
    </div>
  );
}
