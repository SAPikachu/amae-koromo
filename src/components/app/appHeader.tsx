import React from "react";

import { Container } from "../layout";
import { Alert } from "../misc/alert";
import Conf from "../../utils/conf";
import { useTranslation } from "react-i18next";

function AlertDefault() {
  return (
    <>
      <h4>说明</h4>
      <ul>
        <li>
          <strong>
            因发现「立直放铳」的算法（立直瞬间放铳的处理）有误，「立直放銃」「立直収入」与「立直収支」暂时从详情页隐藏，待数据修复后再重新显示。非常抱歉为您带来不便。
          </strong>
        </li>
        <li>本页面数据由第三方维护，不能绝对保证完整和正确，信息仅供参考，请勿用于不良用途。</li>
        <li>{Conf.siteSpecificNotice}</li>
        <li>页面不是实时更新，对局一般会在结束后数分钟至数小时内出现。</li>
        <li>对局数据收集从{Conf.dateMin.format(" YYYY 年 M 月 D 日")}开始，之前的对局已无法获取。</li>
        <li>
          网站主线路会收集少量匿名浏览数据作后续改进及优化之用，如不希望被收集数据，请使用
          <a href={Conf.mirrorUrl}>镜像线路</a>。
        </li>
        <li>
          如有问题或建议，请戳 <a href="mailto:i@sapika.ch">SAPikachu (i@sapika.ch)</a> 或{" "}
          <a href="https://github.com/SAPikachu/amae-koromo/">提交 Issue</a>。
        </li>
        <li>
          感谢 <a href="https://github.com/kamicloud/">Kamicloud</a> 提供部分数据。
        </li>
      </ul>
    </>
  );
}

function AlertEn() {
  return (
    <>
      <h4>Notes</h4>
      <ul>
        <li>
          <strong>
            Algorithm of &ldquo;Avg riichi deal-in&rdquo; is found to be incorrect, so we are temporarily removing &ldquo;Avg riichi
            deal-in&rdquo;, &ldquo;Avg riichi hand value&rdquo; and &ldquo;Riichi payment&rdquo; from player detail page. They will be available again
            after data is fixed. Sorry for the inconvenience.
          </strong>
        </li>
        <li>
          This is a fan site, data accuracy can&apos;t be fully guaranteed, please use the data for reference only and
          don&apos;t use it for malicious purpose.
        </li>
        <li>At this moment, only south matches are recorded, east matches are not included in the data.</li>
        <li>
          Data is not updated in real-time, finished matches will show up on the site in a few minutes to a few hours.
        </li>
        <li>
          Data collection was started from {Conf.dateMin.format(" YYYY-MM-DD")}, matches finished before then could no
          longer be retrived.
        </li>
        <li>
          Main mirror of the site collects small amount of anonymous usage data for improving the site. If you wish to
          opt-out from this, please use <a href={Conf.mirrorUrl}>the alternative mirror</a>.
        </li>
        <li>
          If you have any question or suggestion, feel free to email{" "}
          <a href="mailto:i@sapika.ch">SAPikachu (i@sapika.ch)</a> or{" "}
          <a href="https://github.com/SAPikachu/amae-koromo/">submit an issue</a>.
        </li>
        <li>
          English translation of the site is contributed by <a href="https://github.com/Mjonir">Mjonir</a> and{" "}
          <a href="https://github.com/kator-278">kator-278</a>. Thank you!
        </li>
        <li>
          感谢 <a href="https://github.com/kamicloud/">Kamicloud</a> 提供部分数据。
        </li>
      </ul>
    </>
  );
}

function AlertJa() {
  return (
    <>
      <h4>説明</h4>
      <ul>
        <li>
          <strong>
            ただいま、「立直放銃」の計算の誤り（立直瞬間放銃の立直棒の扱い）を発見しましたので、「立直放銃」「立直収入」と「立直収支」をサイトから暫く隠しました。データを修正する後改めて掲載します。ご迷惑をかけて申し訳ございません。
          </strong>
        </li>
        <li>
          当サイトは非公式サイトで、データの完全性と正確性が保証できません、予めご了承ください。サイトの内容を悪用しないでください。
        </li>
        <li>現時点では半荘戦だけ記録しています。東風戦のデータは含まれません。</li>
        <li>データの更新はリアルタイムではありません。対局がサイトに載せるまで数分から数時間がかかります。</li>
        <li>
          データの収集は{Conf.dateMin.format(" YYYY 年 M 月 D 日")}からです。収集が始まるまでの対戦は検索できません。
        </li>
        <li>
          <a href={"https://" + Conf.canonicalDomain}>メーンサイト</a>
          はサービス向上のため、少しの匿名使用情報を収集しています。希望しない方は、
          <a href={Conf.mirrorUrl}>ミラーサイト</a>を使ってください。
        </li>
        <li>
          内容の誤り・誤植等はご報告いただけますと幸いです。 <a href="mailto:i@sapika.ch">SAPikachu (i@sapika.ch)</a>{" "}
          または <a href="https://github.com/SAPikachu/amae-koromo/">GitHub</a> でご連絡ください。
        </li>
        <li>
          感谢 <a href="https://github.com/kamicloud/">Kamicloud</a> 提供部分数据。
        </li>
      </ul>
    </>
  );
}

export function AppHeader() {
  const { i18n } = useTranslation();
  return (
    <Alert container={Container} stateName="topNote20201024">
      {i18n.language.indexOf("ja") === 0 ? (
        <AlertJa />
      ) : i18n.language.indexOf("en") === 0 ? (
        <AlertEn />
      ) : (
        <AlertDefault />
      )}
    </Alert>
  );
}
