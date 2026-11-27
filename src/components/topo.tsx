import Image from 'next/image'

type Props = {
  /** Versão grande, com o nome do produto: usada no login e no cadastro. */
  grande?: boolean
}

/**
 * Faixa branca com o logo e o efeito de papel rasgado por cima do fundo escuro.
 */
export default function Topo({ grande = false }: Props) {
  return (
    <header>
      <div
        className={`flex flex-col items-center bg-white ${
          grande ? 'pt-12 pb-3' : 'pt-5 pb-1'
        }`}
      >
        <Image
          src="/logo.png"
          alt="StudioControl"
          width={259}
          height={243}
          priority
          className={grande ? 'h-auto w-40' : 'h-auto w-24'}
        />
        {grande && (
          <p className="mt-2 text-2xl font-bold tracking-tight text-fundo">
            Studio Control
          </p>
        )}
      </div>

      {/* Borda de papel rasgado: a parte transparente deixa aparecer o fundo escuro */}
      <div
        aria-hidden="true"
        className="h-[clamp(34px,9vw,64px)] w-full bg-fundo bg-[url('/rasgo.png')] bg-[length:100%_100%] bg-no-repeat"
      />
    </header>
  )
}
