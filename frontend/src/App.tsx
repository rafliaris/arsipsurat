import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Frontend Initialized 🚀</CardTitle>
          <CardDescription>React 19 + Vite + Tailwind 4 + shadcn/ui</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Counter</Label>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setCount((count) => count - 1)}>-</Button>
                <div className="flex-1 text-center font-bold text-xl">{count}</div>
                <Button variant="outline" onClick={() => setCount((count) => count + 1)}>+</Button>
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter your email" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost">Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default App
