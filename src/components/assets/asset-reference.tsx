import Image from "next/image";

export function AssetReference() {
  return <div className="asset-reference"><Image src="/fixtures/mina-portrait.jpg" alt="Mina" width={52} height={46} sizes="52px"/><div><span>캐릭터</span><strong>Mina</strong></div><button className="quiet-button">변경</button></div>;
}
