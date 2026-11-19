import { useState } from 'react';

export function useSort(defaultKey = 'name', defaultOrder = 'asc') {
  const [sortBy, setSortBy] = useState(defaultKey);
  const [order, setOrder] = useState(defaultOrder);

  const onSort = (key) => {
    if (key === sortBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setOrder('asc');
    }
  };

  return { sortBy, order, onSort };
}