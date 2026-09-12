import { useState } from 'react'

export function Tab1() {
    const [count, setCount] = useState(0)
    return (
        <div>
            <h1>Tab 1</h1>
            <button onClick={() => setCount(count + 1)}>{count}</button>
        </div>
    )
}