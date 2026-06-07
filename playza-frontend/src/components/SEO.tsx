import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
  noIndex?: boolean
}

const BASE_URL = 'https://playza.games'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`
const SITE_NAME = 'Playza'
const TWITTER_HANDLE = '@playzadotgames'

const DEFAULT = {
  title: 'Playza – Play Games, Win Real Money',
  description: "Nigeria's #1 competitive gaming platform. Play skill-based games, join tournaments, challenge friends in H2H matches, and win real ZA rewards.",
  keywords: 'playza, play games online, win real money Nigeria, skill games, H2H games, online tournaments, leaderboard games, competitive gaming',
  image: DEFAULT_IMAGE,
  url: BASE_URL,
}

const SEO = ({
  title,
  description = DEFAULT.description,
  keywords = DEFAULT.keywords,
  image = DEFAULT.image,
  url,
  type = 'website',
  noIndex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT.title
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_NG" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}

export default SEO
