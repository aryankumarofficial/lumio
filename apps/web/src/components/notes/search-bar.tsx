'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@repo/ui/components/input'
import { useDebounce } from '../../hooks/use-debounce'
import { useNotes } from '../../hooks/use-notes'

export function SearchBar() {
  const { setSearch } = useNotes()
  const [value, setValue] = useState('')
  const debounced = useDebounce(value)

  useEffect(() => {
    setSearch(debounced)
  }, [debounced, setSearch])

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="rounded-full border-border/60 bg-card/80 pl-9 pr-4"
        placeholder="Search notes..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}