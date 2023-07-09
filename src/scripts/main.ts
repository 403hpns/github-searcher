import "../styles/style.scss";

const buttonsArray =
  document.querySelectorAll<HTMLButtonElement>(".form__button");
const searchUserBtn = document.querySelector(".form__button--search-user");
const searchRepoBtn = document.querySelector(".form__button--search-repo");
const searchInput = document.querySelector<HTMLInputElement>(".form__input");
const resultsSection = document.querySelector<HTMLDivElement>(".results");
const resultsContent =
  document.querySelector<HTMLParagraphElement>(".results__content");
const loaderImage = document.querySelector<HTMLImageElement>(".image-loader");
const noResultsElement =
  document.querySelector<HTMLHeadingElement>(".no-results");

const clearResultsButton = document.querySelector(
  ".form__button--clear-results"
);

window.addEventListener("keydown", (key) => {
  if (key.code === "Enter") {
    if (document.activeElement === searchInput && searchInput?.value !== "") {
      (searchUserBtn as HTMLElement).focus();
    }
  }
});

buttonsArray.forEach((button) =>
  button.addEventListener("click", (ev) => {
    ev.preventDefault();

    const searchInputValue = searchInput?.value;
    if (!searchInputValue) {
      searchInput!.placeholder = "You have to type a search term";
      return;
    }

    button === searchUserBtn && fetchUserDataFromGitHub(searchInputValue);
    button === searchRepoBtn && fetchRepoDataFromGitHub(searchInputValue);
    button === clearResultsButton && clearResults();
  })
);

const fetchUserDataFromGitHub = async (userName: string) => {
  if (!isResultsShown()) {
    resultsSection?.classList.add("hidden");
  }

  clearResults();
  toggleLoader();

  try {
    const response = await fetch(`https://api.github.com/users/${userName}`, {
      method: "GET",
      headers: {
        Authorization: import.meta.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error("Something went wrong! Please try again");
    }

    const data = await response.json();

    const {
      login,
      avatar_url,
      bio,
      created_at,
      email,
      followers,
      following,
      location,
      name,
      public_repos,
    } = data;

    createResultElement({
      Login: login,
      Name: name,
      Bio: bio,
      "E-mail": email,
      Location: location,
      Followers: followers,
      Following: following,
      "Public repositories": public_repos,
      "Created at": created_at,
      "Avatar url": avatar_url,
    });

    toggleLoader();
    resultsSection?.classList.remove("hidden");
  } catch (error) {
    loaderImage?.classList.toggle("hidden");
    noResultsElement?.classList.toggle("hidden");
  }
};

const fetchRepoDataFromGitHub = async (repositoryName: string) => {
  if (!isResultsShown()) {
    resultsSection?.classList.add("hidden");
  }

  clearResults();
  toggleLoader();

  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${repositoryName}}`,
      {
        method: "GET",
        headers: {
          Authorization: import.meta.env.GITHUB_PERSONAL_ACCESS_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Something went wrong! Please try again");
    }

    const data = await response.json();

    const { total_count, items } = data;

    if (total_count < 1) {
      throw new Error("Repositories not found");
    }

    const repositories = [...items];
    repositories.map((item) => {
      const {
        id,
        full_name,
        description,
        created_at,
        updated_at,
        language,
        owner,
        watchers,
        stargazers_count,
        forks,
        archived,
      } = item;

      createResultElement({
        Id: id,
        "Full name": full_name,
        Description: description,
        "Created at": created_at,
        "Updated at": updated_at,
        Language: language,
        Owner: owner.login,
        Stars: stargazers_count,
        Watchers: watchers,
        Forks: forks,
        Archived: archived,
      });
    });

    toggleLoader();
    resultsSection?.classList.remove("hidden");
  } catch (error) {
    loaderImage?.classList.toggle("hidden");
    noResultsElement?.classList.toggle("hidden");
  }
};

const createResultElement = (data: { [key: string]: string }) => {
  const container = document.createElement("div");
  const containerBottomBorderLine = document.createElement("span");
  let resultElement;

  container.classList.add("results__container");
  containerBottomBorderLine.classList.add(
    "results__container--bottom-border-line"
  );

  for (const [resultKey, resultValue] of Object.entries(data)) {
    resultElement = document.createElement("div");
    const key = document.createElement("p");
    const value = document.createElement("p");

    resultElement.classList.toggle("result-element");

    key.style.fontWeight = "600";
    key.style.color = "#319ed2";
    key.textContent = `${resultKey}:`;
    value.textContent = resultValue;

    if (resultValue == null) {
      value.textContent = "not specified";
    }

    resultElement.append(key, value);
    container.append(resultElement, containerBottomBorderLine);
    resultsContent?.append(container);
  }
};

const toggleLoader = () => {
  loaderImage?.classList.toggle("hidden");
};

const clearResults = () => {
  noResultsElement?.classList.add("hidden");

  !resultsSection?.classList.contains("hidden") &&
    resultsSection?.classList.add("hidden");
  resultsContent?.hasChildNodes() && resultsContent?.replaceChildren();
};

const isResultsShown = () => resultsSection?.classList.contains("hidden");
