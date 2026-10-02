'use client'

import {useEffect} from 'react'

import {track} from '@/lib/analytics'

export function SearchTracker({term, results}: {term: string; results: number}) {
  useEffect(() => {
    if (term) track('search', {search_term: term, results})
  }, [term, results])
  return null
}
