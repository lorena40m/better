import Image from "next/image"
import {
  Grid,
  Button,
  Typography,
  Divider,
  Box,
  Container,
  Stack,
  FormControl,
  TextField,
  Card,
  CardContent,
} from "@mui/material"
import tezosLogo from "@/assets/images/tezos_gradient.svg"
import { formatPrice, formatToken } from '@/utils/format'
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import { useState, useEffect } from 'react'

export default function ChainStats({ homeResponse, miscResponse, iniSeconds }) {
  const { locale } = useRouter()
  const { t } = useTranslation("common")
  const [seconds, setSeconds] = useState(iniSeconds)
  useEffect(() => {
    let i = setInterval(() => setSeconds(seconds => seconds - 1), 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="ChainStats">
      <div className="ChainStats-box ChainStats-box--important">
        <div className="ChainStats-inner">
          <div className="ChainStats-content">
            <div className="ChainStats-title">
              {t("stat1")}<b>XTZ</b>
            </div>
            <div className="ChainStats-data">
              <span className="gradientText">{ formatPrice(miscResponse.xtzPrice, locale, miscResponse.rates) }</span>
            </div>
          </div>
          <Image priority src={tezosLogo} height={40} width={50} alt="" className="cryptoLogo" />
        </div>
      </div>
      <div className="ChainStats-box">
        <div className="ChainStats-inner">
          <div className="ChainStats-content">
            <div className="ChainStats-title">
              {t("stat2")}
            </div>
            <div className="ChainStats-data">
              <span className="gradientText">{formatPrice((+homeResponse.stats.normalFee / 1_000_000) * +miscResponse.xtzPrice, locale, miscResponse.rates)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="ChainStats-box">
        <div className="ChainStats-inner">
          <div className="ChainStats-content">
            <div className="ChainStats-title">
              {t("stat3")}
            </div>
            <div className="ChainStats-data">
              <span className="gradientText">{t('inXSeconds', {seconds: 15 + seconds % 15})}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
