import * as React from "react"
import Link from "next/link"
import { styled } from "@mui/material/styles"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell, { tableCellClasses } from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import Image from "next/image"
import MenuItem from "@mui/material/MenuItem"
import { Box, Grid } from "@mui/material"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { formatPrice, formatToken } from '../../utils/format'

export default function TokenRanking({ coins, rates }) {
  const { t } = useTranslation("common")
  const { locale } = useRouter()

  return (
    <Box className="TokenRanking">
      <Grid container className="TokenRanking-container">
        {[0, 1].map(x => (
          <Grid key={x} item xl={6} className={(x === 1 ? 'bigOnly' : '')}>
            {coins.map((coin, i) => (
              <Link key={coin.id + coin.token_id} href={'/' + coin.id}
                className={"TokenRanking-TokenBox " + (i % 2 !== x ? 'smallOnly' : '')}
              >
                <Grid container>
                  <Grid item sm={2} className="TokenRanking-col">
                    <img src={coin.logo} alt={coin.ticker} width={64} />
                  </Grid>
                  <Grid item sm={6} className="TokenRanking-col">
                    <div className="TokenRanking-names" title={coin.name}>
                      <span className="TokenRanking-name">{coin.name}</span>
                      <span className="TokenRanking-ticker">{coin.ticker}</span>
                    </div>
                    <span className="TokenRanking-supply">{t('TokenRanking.supply')} {formatToken(BigInt(coin.circulatingSupplyOnChain).toString(), 0, locale)}</span>
                    <br/><span className="TokenRanking-holders">{t('TokenRanking.holders')} {coin.holders && formatToken(BigInt(coin.holders).toString(), 0, locale)}</span>
                  </Grid>
                  <Grid item sm={4} className="TokenRanking-col">
                    <span className="TokenRanking-price">{formatPrice(coin.lastPrice, locale, rates)}</span>
                    <br/><span className="TokenRanking-mcap">{t('TokenRanking.mcap')}<br/>{formatPrice(coin.capitalizationOnChain, locale, rates)}</span>
                    {/*<br/>Price: {coin.lastPrice}*/}
                  </Grid>
                </Grid>
              </Link>
            ))}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
