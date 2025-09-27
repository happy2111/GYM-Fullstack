import { Helmet } from "@dr.pogodin/react-helmet";

export default function PageHelmet({ title, description, keywords }) {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
    </Helmet>
  );
}
