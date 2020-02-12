import React from "react";

import { Container } from "../layout";
import { Alert } from "../misc/alert";
import Conf from "../../utils/conf";

export function AppHeader() {
  return (
    <Alert container={Container} stateName="topNote20200103">
      <h4>说明</h4>
      <ul>
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
    </Alert>
  );
}
