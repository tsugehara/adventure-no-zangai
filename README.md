# アドベンチャーゲームっぽいもの

アドベンチャーゲームっぽいものです。

## 使い方

以下を実行すれば http://localhost:3000 にサーバが立つので見ることができます。

```bash
npm i
npm start
```

http://localhost:3000/ でアドベンチャーゲーム本体、 http://localhost:3000/flowchart.html でアドベンチャーゲームをフローチャートに変換する謎技術を見ることができます。

## ライセンス等

背景素材は[気まぐれアフター](http://www5d.biglobe.ne.jp/~gakai/)さんのものを使っています。以下3ファイルは配布元の規約に準じて取り扱ってください。

- ekimae.jpg
- hankagai.jpg
- house.jpg

キャラクター画像は[キャラクターなんとか機](http://khmix.sakura.ne.jp/download.shtml)で作成されています。以下5ファイルは配布元の規約に準じて取り扱ってください。

- chara1.png
- chara2.png
- chara3.png
- chara3-angry.png
- chara3-smile.png

他は全部MIT相当です。

## 注釈

adventure.jgame.jsの以下が動かなかったので、

```
    })(jgengine.ManualGame);
```

類似っぽいこれに変えました。弊害は不明です。

```
    })(jgengine.StaticGame);
```

また、アドベンチャーゲームの特定シーンまで行くと、 `this.focus.focus()` という処理で例外を吐きます。これはちょっと調べてないので放置してあります。

いかんせん昔のものなので、他にもまだ何か不具合等があるかもしれません。
