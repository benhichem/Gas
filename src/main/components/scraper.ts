/* interface ScraperConstructor {
  keywords: Array<string>;
  language: string;
  computer?: boolean;
  emulation?: "ANDROID" | "IOS";
} */

import { Browser, Page, KnownDevices, Device } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { DeviceType } from ".";

puppeteer.use(StealthPlugin());

//TODO:  fill payload type

abstract class Scraper {
  protected Browser: Browser | null;
  protected Page: Page | null;
  protected payload: Array<unknown>;

  constructor() {
    this.Browser = null;
    this.Page = null;
    this.payload = [];
  }

  // Abstract methods to be implemented by subclasses
  abstract Intialisation(): Promise<void>;
  abstract Extraction(): Promise<void>;

  async TearDown(): Promise<void> {
    if (this.Page !== null) {
      await this.Page.close();
    }
    if (this.Browser !== null) {
      await this.Browser.close();
    }
  }

  async Launch() {
    console.log("Launching process ...");

    // Step 1: Call Initialization
    console.log("Initializing Browser ...");
    await this.Intialisation();

    // Step 2: Call Extraction
    console.log("Extracting ...");
    await this.Extraction();

    // Step 3: Call TearDown
    console.log("Cleaning up ...");
    await this.TearDown();

    return this.payload;
  }
}

export class BrowserProcess extends Scraper {
  constructor(
    private keywords: Array<string>,
    private language: string,
  ) {
    super();
  }

  async Intialisation(): Promise<void> {
    this.Browser = await puppeteer.launch({
      headless: false,
      /*       userDataDir: "profile", */
    });
    this.Page = await this.Browser.newPage();
    await this.Page.setExtraHTTPHeaders({
      "Accept-Language": this.language, // Change this to your desired language
    });
  }
  async Extraction(): Promise<void> {
    if (this.Page !== null) {
      for (let i = 0; i < this.keywords.length; i++) {
        let keyword: string = this.keywords[i];
        await this.Page.goto("https://www.google.com", {
          timeout: 0,
          waitUntil: "networkidle2",
        });
        await this.Page.type("input", keyword.trim(), { delay: 100 });
        await this.Page.keyboard.press("Enter");
        await this.Page.waitForNavigation({ waitUntil: "networkidle2" });
        //@ts-ignore
        const elemnts = await this.Page.evaluate(() => {
          let Sponsered = [...document.querySelectorAll("div.uEierd")];
          if (Sponsered.length > 0) {
            let Values = Sponsered.map((item) => {
              let Letlink = [...item.querySelectorAll("a")].filter(
                (item) => !(item as HTMLAnchorElement).href.includes("google"),
              );
              let WebsiteUrl = Letlink.length
                ? Letlink.filter((item) => item.href !== "")[0].href
                : 0;

              let Title = item.querySelectorAll("span")[1]
                ? (item.querySelectorAll("span")[1] as HTMLElement).innerText
                : "";
              let Description = item.querySelector("div.Va3FIb.r025kc.lVm3ye")
                ? (
                    item.querySelector(
                      "div.Va3FIb.r025kc.lVm3ye",
                    ) as HTMLElement
                  ).innerText
                : "";
              return {
                WebsiteUrl,
                Title,
                Description,
              };
            });
            return Values;
          }
        });
        if (elemnts) {
          let items = elemnts?.map((item) => {
            return { ...item, keyword };
          });
          this.payload = [...this.payload, ...items];
        }
      }
    } else {
      throw new Error("Page Is not Initialized ...");
    }
  }
}

export class PhoneProcess extends Scraper {
  constructor(
    private deviceType: DeviceType,
    //@ts-ignore
    private language: string,
    private keywords: Array<string>,
  ) {
    super();
  }

  private PickSystem() {
    let device: Device;
    switch (this.deviceType) {
      case "android":
        device = KnownDevices["Galaxy S9+ landscape"];
        break;
      case "ios":
        device = KnownDevices["iPhone X landscape"];
        break;
    }
    return device;
  }

  async Intialisation(): Promise<void> {
    this.Browser = await puppeteer.launch({
      headless: false,
      /*       userDataDir: "profile", */
      args: [],
    });
    this.Page = await this.Browser!.newPage();
    await this.Page.setViewport({
      height: 900,
      width: 1600,
    });
    await this.Page.emulate(this.PickSystem());
  }
  async Extraction(): Promise<void> {
    if (this.Page !== null) {
      for (let i = 0; i < this.keywords.length; i++) {
        let keyword: string = this.keywords[i];
        await this.Page.goto("https://www.google.com", {
          timeout: 0,
          waitUntil: "networkidle2",
        });
        await this.Page.type("input", keyword.trim(), { delay: 100 });
        await this.Page.keyboard.press("Enter");
        await this.Page.waitForNavigation({ waitUntil: "networkidle2" });
        //@ts-ignore
        const elemnts = await this.Page.evaluate(() => {
          let Sponsered = [...document.querySelectorAll("div.uEierd")];
          if (Sponsered.length > 0) {
            let Values = Sponsered.map((item) => {
              let Letlink = [...item.querySelectorAll("a")].filter(
                (item) => !(item as HTMLAnchorElement).href.includes("google"),
              );
              let WebsiteUrl = Letlink.length
                ? Letlink.filter((item) => item.href !== "")[0].href
                : 0;

              let Title = item.querySelectorAll("span")[1]
                ? (item.querySelectorAll("span")[1] as HTMLElement).innerText
                : "";
              let Description = item.querySelector("div.Va3FIb.r025kc.lVm3ye")
                ? (
                    item.querySelector(
                      "div.Va3FIb.r025kc.lVm3ye",
                    ) as HTMLElement
                  ).innerText
                : "";
              return {
                WebsiteUrl,
                Title,
                Description,
              };
            });
            return Values;
          }
        });

        if (elemnts) {
          let items = elemnts?.map((item) => {
            return { ...item, keyword };
          });
          this.payload = [...this.payload, ...items];
        }
      }
    } else {
      throw new Error("Page Is not Initialized ...");
    }
  }
}

/* const TestScript = new BrowserProcess(["feafea"], "fr").Launch();
 */
