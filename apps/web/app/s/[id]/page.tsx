import { OpenLink } from "./open-link";

export default function SharedPage({ params }: { params: { id: string } }) {
  return <OpenLink id={params.id} />;
}
