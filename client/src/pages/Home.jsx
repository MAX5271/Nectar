import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '../components/Header'

export default function Home() {
  const [plans, setPlans] = useState([])

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get('/api/diets')
        setPlans(res.data.data || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchPlans()
  }, [])

  return (
    <div>
      <Header />
      <main>
        <h2>Diet Plans</h2>
        {plans.length === 0 && <p>No plans yet.</p>}
        <ul>
          {plans.map((p) => (
            <li key={p._id}>{p.title} — {p.totalCalories} kcal</li>
          ))}
        </ul>
      </main>
    </div>
  )
}
