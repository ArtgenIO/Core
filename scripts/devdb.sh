#!/bin/bash
echo -e "\e[1;33mArtgen\e[0m - \e[1;33mConfigure your local development environment\e[0m\n"

PS3='Choose the database provider: '
options=("PostgreSQL" "SQLite (Memory)")
select opt in "${options[@]}"
do
    case $opt in
        "PostgreSQL")
            echo "export ARTGEN_DATABASE_DSN=postgres://artgen:artgen@localhost:5432/artgen" > .temp_env
            ;;
        "SQLite (Memory)")
            echo "export ARTGEN_DATABASE_DSN=sqlite::memory:" > .temp_env
            ;;
        *) echo "Invalid Option $REPLY";;
    esac

    source .temp_env
    rm .temp_env

    echo -e "Database DSN is set to [\e[36m$opt\e[0m] [\e[1;32m$ARTGEN_DATABASE_DSN\e[0m]"

    break
done