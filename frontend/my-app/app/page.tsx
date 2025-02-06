import Image from "next/image";
import { Separator } from "@/components/ui/separator"


export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center max-w-screen min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="space-y-1">
          <h4 className="text-xl font-medium leading-none">Fresto HD Homepage</h4>
          <p className="text-sm text-muted-foreground">
            Fresto Harddisk Inventory
          </p>
        </div>
        <Separator className="my-4" />
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>Foo</div>
          <Separator orientation="vertical" />
          <a href={'/harddisk'}>Inventory</a>
          <Separator orientation="vertical" />
          <div>Something</div>
        </div>
      </main>
    </div>
  );
}
