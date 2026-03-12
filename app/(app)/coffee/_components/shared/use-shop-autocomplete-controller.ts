'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import {
  buildShopSearchUrl,
  getNextActiveIndex,
  shouldShowSuggestions,
  type ShopSuggestion,
} from './shop-autocomplete-helpers'

const DEBOUNCE_MS = 300

type Input = {
  onChange: (name: string, shopId: string | null) => void
}

export function useShopAutocompleteController({ onChange }: Input) {
  const [suggestions, setSuggestions] = useState<ShopSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // stale response 防止用シーケンス番号。fetch 開始時にインクリメントし、
  // レスポンス到着時に現在値と一致しなければ state 更新をスキップする。
  const requestSeqRef = useRef(0)

  const closeSuggestions = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  const resetSuggestions = useCallback(() => {
    setSuggestions([])
    closeSuggestions()
  }, [closeSuggestions])

  const fetchSuggestions = useCallback(async (query: string) => {
    // インクリメントして「この fetch の世代番号」を確定する。
    // 入力が空でも番号を進め、進行中の古い fetch が state を書き換えるのを防ぐ。
    const seq = ++requestSeqRef.current
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      resetSuggestions()
      return
    }

    try {
      const response = await fetch(buildShopSearchUrl(normalizedQuery))
      if (seq !== requestSeqRef.current) return  // 古い世代のレスポンスは破棄

      if (!response.ok) {
        resetSuggestions()
        return
      }

      const nextSuggestions: ShopSuggestion[] = await response.json()
      if (seq !== requestSeqRef.current) return  // JSON parse 中に打ち替えが来た場合も破棄

      setSuggestions(nextSuggestions)
      setIsOpen(shouldShowSuggestions(normalizedQuery, nextSuggestions.length))
      setActiveIndex(-1)
    } catch {
      if (seq === requestSeqRef.current) resetSuggestions()
    }
  }, [resetSuggestions])

  const scheduleSuggestionsFetch = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(query)
    }, DEBOUNCE_MS)
  }, [fetchSuggestions])

  const handleInputChange = useCallback((value: string) => {
    onChange(value, null)
    scheduleSuggestionsFetch(value)
  }, [onChange, scheduleSuggestionsFetch])

  const handleInputElementChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    handleInputChange(event.target.value)
  }, [handleInputChange])

  const handleSelect = useCallback((suggestion: ShopSuggestion) => {
    onChange(suggestion.name, suggestion.id)
    resetSuggestions()
  }, [onChange, resetSuggestions])

  const handleArrowDown = useCallback(() => {
    setActiveIndex((currentIndex) =>
      getNextActiveIndex(currentIndex, suggestions.length, 'next')
    )
  }, [suggestions.length])

  const handleArrowUp = useCallback(() => {
    setActiveIndex((currentIndex) =>
      getNextActiveIndex(currentIndex, suggestions.length, 'previous')
    )
  }, [suggestions.length])

  const handleEnter = useCallback(() => {
    if (activeIndex < 0 || activeIndex >= suggestions.length) return
    handleSelect(suggestions[activeIndex])
  }, [activeIndex, handleSelect, suggestions])

  const handleInputKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        handleArrowDown()
        break
      case 'ArrowUp':
        event.preventDefault()
        handleArrowUp()
        break
      case 'Enter':
        event.preventDefault()
        handleEnter()
        break
      case 'Escape':
        closeSuggestions()
        break
    }
  }, [
    closeSuggestions,
    handleArrowDown,
    handleArrowUp,
    handleEnter,
    isOpen,
    suggestions.length,
  ])

  const openSuggestions = useCallback(() => {
    if (suggestions.length > 0) {
      setIsOpen(true)
    }
  }, [suggestions.length])

  const highlightSuggestion = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeSuggestions()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeSuggestions])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return {
    activeIndex,
    containerRef,
    isOpen,
    suggestions,
    closeSuggestions,
    handleArrowDown,
    handleArrowUp,
    handleEnter,
    handleInputChange,
    handleInputElementChange,
    handleInputKeyDown,
    handleSelect,
    highlightSuggestion,
    openSuggestions,
  }
}
