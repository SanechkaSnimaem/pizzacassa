// Сервер отправляет заказы в Telegram. Токен храните только в .env, не во фронтенде.
require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
app.use(express.json({limit:"20kb"}));
app.use(express.static(path.join(__dirname)));

app.post("/api/order", async (req,res)=>{
  const {name,phone,address,comment="",items,total}=req.body||{};
  if(!name||!phone||!address||!Array.isArray(items)||items.length===0)
    return res.status(400).json({error:"Заполните имя, телефон, адрес и добавьте товары."});
  if(!process.env.TELEGRAM_BOT_TOKEN||!process.env.TELEGRAM_CHAT_ID)
    return res.status(500).json({error:"Telegram ещё не настроен. Добавьте токен и chat ID в файл .env."});

  const safe = value => String(value).replace(/[<>&]/g, c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]));
  const lines=items.map(i=>`• ${safe(i.name)} × ${Number(i.qty)} — €${(Number(i.price)*Number(i.qty)).toFixed(2)}`).join("\n");
  const textMessage=[
    "🍕 <b>НОВЫЙ ЗАКАЗ — PIZZA CASA</b>",
    "",
    `<b>Имя:</b> ${safe(name)}`,
    `<b>Телефон:</b> ${safe(phone)}`,
    `<b>Адрес:</b> ${safe(address)}`,
    "",
    "<b>Заказ:</b>",
    lines,
    "",
    `<b>Итого:</b> €${Number(total).toFixed(2)}`,
    comment ? `<b>Комментарий:</b> ${safe(comment)}` : ""
  ].filter(Boolean).join("\n");

  try{
    const tg=await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,text:textMessage,parse_mode:"HTML"})
    });
    const result=await tg.json();
    if(!tg.ok||!result.ok)throw new Error(result.description||"Telegram API error");
    res.json({ok:true});
  }catch(error){
    console.error("Telegram error:",error.message);
    res.status(502).json({error:"Telegram не принял заказ. Попробуйте ещё раз или позвоните нам."});
  }
});
const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`Pizza Casa запущен: http://localhost:${port}`));
