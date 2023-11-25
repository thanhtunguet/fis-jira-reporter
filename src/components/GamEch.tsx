import {useTranslation} from 'react-i18next';

function GamEch() {
  const [translate] = useTranslation();

  return <span> {translate('all.gamEch')} </span>;
}

export default GamEch;
