import { useState, useEffect } from 'react'
import axios from 'axios'

export default function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    axios.get(url)
      .then((res) => { if (mounted) setData(res.data) })
      .catch((e) => { if (mounted) setError(e) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [url])

  return { data, loading, error }
}
