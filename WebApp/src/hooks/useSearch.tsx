import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { fetchAddressFromDomain } from '@/utils/apiClient';

const useSearch = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [animError, setAnimError] = useState(false);

  const searchEvent = useCallback(() => {
    if (search && search[0]) {
      if (search.length > 6 && search.slice(-4) === '.tez') {
        fetchAddressFromDomain(search).then(data => {
          if (data) {
            router.push(`/${encodeURIComponent(data)}`);
          } else {
            setAnimError(true);
            setTimeout(() => {
              setAnimError(false);
            }, 750);
          }
        });
      } else if (
        ((search.substring(0, 2) === 'tz' || search.substring(0, 2) === 'KT') && search.length === 36) ||
        (search.substring(0, 1) === 'o' && search.length === 51)
      ) {
        router.push(`/${encodeURIComponent(search)}`);
      } else {
        setAnimError(true);
        setTimeout(() => {
          setAnimError(false);
        }, 750);
      }
    } else {
      setAnimError(true);
      setTimeout(() => {
        setAnimError(false);
      }, 750);
    }
  }, [search, router]);

  return {
    search,
    setSearch,
    animError,
    searchEvent,
  };
};

export default useSearch;
